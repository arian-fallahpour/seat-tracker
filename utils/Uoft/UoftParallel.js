const { maxRequestsPerLambda, maxConcurrentLambdas } = require("../../data/alerts-data");
const lambdaData = require("../../data/lambda-data");
const LambdaAdapter = require("../services/LambdaAdapter");
const UoftAdapter = require("./UoftAdapter");

class UoftParallel {
  static axiosRequestNames = lambdaData.functions.dynamic.axiosRequest;

  /**
   * Gets updated version of courses in the courseCodes array and returns them in an object based on course codes
   */
  static async fetchAllLambda(courseCodes) {
    const updatedCoursesByCode = {};

    // Fetch updated course data function
    async function fetchCourse(courseCode, lambdaFunctionName) {
      const fetchedCourses = await UoftAdapter.fetchCourses({
        query: courseCode,
        lambdaFunctionName,
      });

      for (const fetchedCourse of fetchedCourses) {
        updatedCoursesByCode[fetchedCourse.code] = fetchedCourse;
      }
    }

    // Distribute fetch requests across all lambdas
    let iterations = [];
    courseCodes.forEach((courseCode, i) => {
      const iterationsIndex = Math.floor(i / (maxRequestsPerLambda * maxConcurrentLambdas));
      if (!iterations[iterationsIndex]) {
        iterations[iterationsIndex] = [];
      }

      const lambdaGroupIndex = i % maxConcurrentLambdas;
      if (!iterations[iterationsIndex][lambdaGroupIndex]) {
        iterations[iterationsIndex][lambdaGroupIndex] = [];
      }

      const functionName = lambdaData.functions.dynamic.axiosRequest[lambdaGroupIndex];
      iterations[iterationsIndex][lambdaGroupIndex].push(() =>
        fetchCourse(courseCode, functionName)
      );
    });

    // Handle all requests in each lambdaGroup concurrently and rotating each lambda
    iterations = iterations.map((lambdaGroups) => {
      async function sendAllRequests(lambdaGroup, functionName) {
        await Promise.allSettled(lambdaGroup.map((fn) => fn()));
        await LambdaAdapter.rotate(functionName, lambdaData.functions.static.axiosRequest);
      }

      return lambdaGroups.map((lambdaGroup, i) => {
        return () => sendAllRequests(lambdaGroup, lambdaData.functions.dynamic.axiosRequest[i]);
      });
    });

    // Iteratively settle iterations, that run lambdaGroup request concurrently
    for (const iteration of iterations) {
      await Promise.allSettled(iteration.map((fn) => fn()));
    }

    return updatedCoursesByCode;
  }
}

module.exports = UoftParallel;

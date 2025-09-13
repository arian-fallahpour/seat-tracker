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
    const iterations = [];
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

    // Process iterations one after another
    for (const lambdaGroups of iterations) {
      const lambdaGroupPromises = lambdaGroups.map(async (lambdaGroup, i) => {
        const functionName = lambdaData.functions.dynamic.axiosRequest[i];

        for (const fn of lambdaGroup) await fn();
        await LambdaAdapter.rotate(functionName, lambdaData.functions.static.axiosRequest);
      });

      await Promise.allSettled(lambdaGroupPromises);
    }

    return updatedCoursesByCode;
  }
}

module.exports = UoftParallel;

const alertsData = require("../../data/alerts-data");
const LambdaAdapter = require("../services/LambdaAdapter");
const UoftAdapter = require("./UoftAdapter");

class UoftParallel {
  /**
   * Gets updated version of courses in the courseCodes array and returns them in an object based on course codes
   */
  static async fetchAllLambda(courseCodes) {
    const updatedCoursesByCode = {};

    // Fetch updated course data function
    const fetchCourse = async (courseCode) => {
      const fetchedCourses = await UoftAdapter.fetchCourses({ query: courseCode });

      for (const fetchedCourse of fetchedCourses) {
        updatedCoursesByCode[fetchedCourse.code] = fetchedCourse;
      }
    };

    // Group promises into alertsData.maxRequestsPerIp length groups
    const promisesGroups = [];
    courseCodes.forEach((courseCode, i) => {
      const index = Math.floor(i / alertsData.maxRequestsPerIp);

      if (!promisesGroups[index]) {
        promisesGroups[index] = [];
      }

      const promise = () => fetchCourse(courseCode);
      promisesGroups[index].push(promise);
    });

    // Await fetches in parallel for each group, while rotating ip each time
    for (const promisesGroup of promisesGroups) {
      const promises = promisesGroup.map((fn) => fn());
      await Promise.allSettled(promises);
      await LambdaAdapter.rotateAxiosRequest();
    }

    return updatedCoursesByCode;
  }
}

module.exports = UoftParallel;

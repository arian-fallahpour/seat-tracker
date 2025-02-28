const axios = require("axios");
const LambdaAdapter = require("./LambdaAdapter");

class UoftAdapter {
  static URL_GET_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses";

  /**
   * FETCH METHODS
   */

  static async fetchCourses(options = {}) {
    options = {
      query: options.query || "",
      page: options.page || 1,
      useLambdaFetch: options.useLambdaFetch || false,
    };

    const fetchOptions = this.getFetchOptions({
      query: options.query,
      page: options.page,
    });

    let response;
    if (!options.useLambdaFetch) {
      response = await this.fetchAxios(fetchOptions);
    } else {
      response = await this.fetchLambda(fetchOptions);
    }

    const { data } = response;
    const coursesData = data.payload.pageableCourse.courses;
    const courses = coursesData.map((courseData) => this.formatCourse(courseData));

    return courses;
  }

  // TODO: Call using lambda function, and update code in lambda every 50 or so requests

  // Gets updated version of courses in the courseCodes array
  static async fetchUpdatedCourses(courseCodes) {
    const updatedCoursesMap = new Map();

    for (const courseCode of courseCodes) {
      const updatedCourses = await this.fetchCourses({ query: courseCode, useLambdaFetch: false });

      for (const updatedCourse of updatedCourses) {
        if (!updatedCoursesMap.has(updatedCourse.code)) {
          updatedCoursesMap.set(updatedCourse.code, updatedCourse);
        }
      }
    }

    return updatedCoursesMap;
  }

  static async fetchAxios(fetchOptions) {
    console.log("[INFO] Making axios request to UOFT API");

    return await axios(fetchOptions);
  }

  static async fetchLambda(fetchOptions) {
    console.log("[INFO] Making lambda request to UOFT API");

    const payload = { options: fetchOptions };
    return await LambdaAdapter.invokeLambdaFunction("axios-request", payload);
  }

  /**
   * FORMAT METHODS
   */

  // Formats course to database course schema
  static formatCourse(courseData) {
    const sections = courseData.sections.map((sectionData) =>
      this.formatSection({ ...sectionData, campus: courseData.campus })
    );

    return {
      name: courseData.name,
      code: `${courseData.code} ${courseData.sectionCode}`,
      term: this.formatTerm(courseData.sessions[courseData.sessions.length - 1]),
      sections,
    };
  }

  // Formats subject to database uoft section schema
  static formatSection(sectionData) {
    return {
      type: sectionData.teachMethod === "TUT" ? "tutorial" : "lab",
      number: sectionData.sectionNumber,
      campus: this.formatCampus(sectionData.campus),
      seatsTaken: sectionData.currentEnrolment,
      seatsAvailable: sectionData.maxEnrolment,
      hasWaitlist: sectionData.waitlistInd === "Y" ? true : false,
      waitlist: sectionData.currentWaitlist,
    };
  }

  // Formats campus to accepted campus enum values for uoft section schema
  static formatCampus(campus) {
    return (
      {
        Scarborough: "Scarborough",
        "University of Toronto at Mississauga": "Mississauga",
        "St. George": "St. George",
      }[campus] || null
    );
  }

  static formatTerm(term) {
    const seasons = {
      1: "winter",
      5: "summer",
      9: "fall",
    };
    if (term)
      return {
        year: Number(term.slice(0, 4)),
        season: seasons[term[4]],
      };
  }

  /**
   * GET METHODS
   */

  // Returns body associated with Uoft API request
  static getBody(options = {}) {
    options = {
      query: options.query || "",
      page: options.page || 1,
    };

    return {
      courseCodeAndTitleProps: {
        courseCode: "",
        courseTitle: options.query,
        courseSectionCode: "",
        searchCourseDescription: true, // Turn on for search
      },
      departmentProps: [],
      campuses: [],
      sessions: ["20249", "20251", "20249-20251"],
      requirementProps: [],
      instructor: "",
      courseLevels: [],
      deliveryModes: [],
      dayPreferences: [],
      timePreferences: [],
      divisions: ["APSC", "ARTSC", "FIS", "FPEH", "MUSIC", "ARCLA", "ERIN", "SCAR"],
      creditWeights: [],
      availableSpace: false,
      waitListable: false,
      page: options.page,
      pageSize: 20,
      direction: "asc",
    };
  }

  static getFetchOptions(options = {}) {
    options = {
      query: options.query || "",
      page: options.page || 1,
    };

    return {
      url: this.URL_GET_COURSES,
      method: "POST",
      data: this.getBody(options),
    };
  }
}

module.exports = UoftAdapter;

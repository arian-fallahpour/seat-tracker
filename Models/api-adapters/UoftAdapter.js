const axios = require("axios");
const path = require("path");

const LambdaAdapter = require("./LambdaAdapter");
const { sleep } = require("../../utils/helper-client");
const alertsData = require("../../data/alerts-data");
const Logger = require("../../utils/Logger");

class UoftAdapter {
  static URL_GET_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses";
  static URL_SMART_PROXY = "https://scraper-api.smartproxy.com/v2/scrape";

  static lambdaRequestsCount = 0;
  static lambdaMaxRequestPerIp = alertsData.maxRequestsPerIp;
  static lambdaFunctionName = "axios-request";

  static seasons = { 1: "winter", 5: "summer", 9: "fall" };
  static campuses = {
    Scarborough: "Scarborough",
    "University of Toronto at Mississauga": "Mississauga",
    "St. George": "St. George",
  };

  /**
   * FETCH METHODS
   */

  /**
   * Returns updated courses based on query and page
   *
   * Logs a warning, does not throw an error
   */
  static async fetchCourses(options = {}) {
    options = {
      query: options.query || "",
      page: options.page || 1,
      useLambdaFetch: options.useLambdaFetch || false,
    };

    // Build fetch options object
    const fetchOptions = this.getFetchOptions({
      query: options.query,
      page: options.page,
    });

    // Make fetch request
    let response;
    try {
      if (!options.useLambdaFetch) {
        response = await this.fetchAxios(fetchOptions);
      } else {
        response = await this.fetchLambda(fetchOptions);
      }
    } catch (error) {
      Logger.warn(`Could not fetch updated UofT courses`, { error: error.message });
      return [];
    }

    // Format fetched data
    const { data } = response;
    const coursesData = data.payload.pageableCourse.courses;
    const courses = coursesData.map((courseData) => this.formatCourse(courseData));

    return courses;
  }

  /**
   * Gets updated version of courses in the courseCodes array and returns them in an object based on course codes
   */
  static async fetchUpdatedCourses(courseCodes) {
    const updatedCourses = {};

    for (const courseCode of courseCodes) {
      const fetchedCourses = await this.fetchCourses({ query: courseCode, useLambdaFetch: true });
      for (const fetchedCourse of fetchedCourses) {
        updatedCourses[fetchedCourse.code] = fetchedCourse;
      }
    }

    return updatedCourses;
  }

  /**
   * Fetches Uoft API data using fetch from current ip
   */
  static async fetchRegular(fetchOptions) {
    Logger.info("Making REGULAR request to UOFT API");

    const response = await fetch(fetchOptions.url, {
      method: fetchOptions.method,
      body: JSON.stringify(fetchOptions.body),
      headers: fetchOptions.headers,
    });
    response.data = await response.json();

    if (!response.ok) {
      throw new Error(response.data.message);
    }

    return response;
  }

  /**
   * Fetches Uoft API data using axios from current ip
   */
  static async fetchAxios(fetchOptions) {
    Logger.info("Making AXIOS request to UOFT API");

    fetchOptions.data = fetchOptions.body;
    fetchOptions.body = undefined;
    return await axios(fetchOptions);
  }

  /**
   * Fetches Uoft API data using lambda for ip rotation
   *
   * NOTE: May throw error when updating code when executed concurrently
   */
  static async fetchLambda(fetchOptions) {
    Logger.info("Making LAMBDA request to UOFT API");

    if (this.lambdaRequestsCount >= this.lambdaMaxRequestPerIp) {
      Logger.info("Updating lambda function code to rotate ip (wait 5 seconds)");

      const filePath = `../../aws/lambdas/${this.lambdaFunctionName}/index.js`;
      const functionFilePath = path.resolve(__dirname, filePath);
      await LambdaAdapter.updateLambdaFunction(this.lambdaFunctionName, functionFilePath);

      // Wait for function to be updated on AWS
      await sleep(5000);

      this.lambdaRequestsCount = 0;
    }

    // Make request to lambda function and increase request count
    const payload = {
      options: {
        url: fetchOptions.url,
        method: fetchOptions.method,
        data: fetchOptions.body,
      },
    };
    const response = await LambdaAdapter.invokeLambdaFunction(this.lambdaFunctionName, payload);
    this.lambdaRequestsCount++;

    return response;
  }

  static async fetchSmartProxy(fetchOptions) {
    const payloadBase64 = Buffer.from(JSON.stringify(fetchOptions.body)).toString("base64");

    const response = await fetch(this.URL_SMART_PROXY, {
      method: fetchOptions.method,
      body: JSON.stringify({
        target: "universal",
        url: "https://api.easi.utoronto.ca/ttb/getPageableCourses",
        http_method: fetchOptions.method,
        payload: payloadBase64,
        headers: fetchOptions.headers,
        force_headers: true,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "",
      },
    });
    response.data = await response.json();

    if (!response.ok) {
      throw new Error(response.data.message);
    }

    return response;
  }

  /**
   * FORMAT METHODS
   */

  static formatCourse(courseData) {
    const sections = courseData.sections.map((sectionData) =>
      this.formatSection({ ...sectionData, campus: courseData.campus })
    );

    return {
      name: courseData.name,
      code: this.formatCourseCode(courseData),
      term: this.formatTerm(courseData.sessions[courseData.sessions.length - 1]),
      sections,
    };
  }

  static formatCourseCode(courseData) {
    return `${courseData.code} ${courseData.sectionCode}`;
  }

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

  static formatCampus(providedCampus) {
    return this.campuses[providedCampus] || null;
  }

  static formatTerm(termData) {
    if (termData) {
      return {
        year: Number(termData.slice(0, 4)),
        season: this.seasons[termData[4]],
      };
    }
  }

  /**
   * GET METHODS
   */

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
      body: this.getBody(options),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
  }
}

module.exports = UoftAdapter;

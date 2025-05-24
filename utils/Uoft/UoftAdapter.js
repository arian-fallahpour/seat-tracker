const axios = require("axios");

const LambdaAdapter = require("../services/LambdaAdapter");
const Logger = require("../Logger");
const UoftFormatter = require("./UoftFormatter");
const lambdaData = require("../../data/lambda-data");

class UoftAdapter {
  static URL_GET_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses";
  static URL_SMART_PROXY = "https://scraper-api.smartproxy.com/v2/scrape";

  /**
   * Returns updated courses based on query and page.
   * Logs a warning in the case of error or failure
   */
  static async fetchCourses(options = {}) {
    options = this.getDefaultOptions(options);
    const fetchOptions = this.getFetchOptions(options);

    // Make fetch request
    let response;
    try {
      if (options.fetchMethod === "lambda") {
        response = await this.fetchLambda(fetchOptions, options);
      } else if (options.fetchMethod === "axios") {
        response = await this.fetchAxios(fetchOptions);
      } else {
        response = await this.fetchRegular(fetchOptions);
      }
    } catch (error) {
      Logger.warn(`Uoft Fetch Courses Error: ${error.message}`, {
        options,
        error: error.message,
      });
      return [];
    }

    // Format fetched data
    const { data } = response;
    const coursesData = data.payload.pageableCourse.courses;
    let courses = coursesData.map((courseData) => UoftFormatter.formatCourse(courseData));
    courses = courses.filter((c) => !!c.campus); // Filter courses without a campus

    return courses;
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
   */
  static async fetchLambda(fetchOptions, options) {
    Logger.info(`Making LAMBDA (${options.lambdaFunctionName}) request to UOFT API`);

    // Make request to lambda function and increase request count
    const payload = {
      options: {
        url: "https://checkip.amazonaws.com/",
        method: "GET",
        // url: fetchOptions.url,
        // method: fetchOptions.method,
        // data: fetchOptions.body,
      },
    };
    const response = await LambdaAdapter.invoke(options.lambdaFunctionName, payload);

    console.log(response);
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

  static getBody(options = {}) {
    options = this.getDefaultOptions(options);

    return {
      courseCodeAndTitleProps: {
        courseCode: "",
        courseTitle: options.query,
        courseSectionCode: "",
        searchCourseDescription: true, // Turn on for search
      },
      departmentProps: [],
      campuses: [],
      sessions: this.getSessions(options),
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
    options = this.getDefaultOptions(options);

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

  static getDefaultOptions(options = {}) {
    return {
      query: options.query || "",
      season:
        options.season && ["fall-winter", "summer"].includes(options.season)
          ? options.season
          : "summer",
      year: options.year || new Date(Date.now()).getFullYear(), // 2025
      page: options.page || 1,
      fetchMethod: options.fetchMethod || "lambda",
      lambdaFunctionName: options.lambdaFunctionName || lambdaData.functions.static.axiosRequest,
    };
  }

  static getSessions(options = {}) {
    options = this.getDefaultOptions(options);

    if (options.season === "fall-winter") {
      return [
        `${String(options.year)}9`,
        `${String(options.year + 1)}1`,
        `${String(options.year)}9-${String(options.year)}1`,
      ];
    } else {
      return [`${String(options.year)}5F`, `${String(options.year)}5S`, `${String(options.year)}5`];
    }
  }
}

module.exports = UoftAdapter;

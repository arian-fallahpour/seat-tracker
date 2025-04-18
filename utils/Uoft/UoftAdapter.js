const axios = require("axios");

const LambdaAdapter = require("../services/LambdaAdapter");
const Logger = require("../Logger");
const UoftFormatter = require("./UoftFormatter");

class UoftAdapter {
  static URL_GET_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses";
  static URL_SMART_PROXY = "https://scraper-api.smartproxy.com/v2/scrape";

  /**
   * Returns updated courses based on query and page.
   * Logs a warning in the case of error or failure
   */
  static async fetchCourses(options = {}) {
    options = {
      query: options.query || "",
      page: options.page || 1,
      fetchMethod: options.fetchMethod || "lambda",
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
      if (options.fetchMethod === "lambda") {
        response = await this.fetchLambda(fetchOptions);
      } else if (options.fetchMethod === "axios") {
        response = await this.fetchAxios(fetchOptions);
      } else {
        response = await this.fetchRegular(fetchOptions);
      }
    } catch (error) {
      Logger.warn(`Could not fetch updated UofT courses`, { error: error.message });
      return [];
    }

    // Format fetched data
    const { data } = response;
    const coursesData = data.payload.pageableCourse.courses;
    const courses = coursesData.map((courseData) => UoftFormatter.formatCourse(courseData));

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
  static async fetchLambda(fetchOptions) {
    Logger.info("Making LAMBDA request to UOFT API");

    // Make request to lambda function and increase request count
    const payload = {
      options: {
        url: fetchOptions.url,
        method: fetchOptions.method,
        data: fetchOptions.body,
      },
    };
    const response = await LambdaAdapter.invokeAxiosRequest(payload);

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

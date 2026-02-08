import {
  FormattedUoftCourseType,
  RawUoftCourseType,
  UoftAdapterAPIOptionsType,
  UoftAdapterLambdaOptionsType,
  UoftAdapterOptionsType,
} from "@/Types/UoftTypes";
import UoftFormatter from "./UoftFormatter";
import LambdaAdapter from "../services/LambdaAdapter";
import Logger from "../Logger";

class UoftAdapter {
  static URL_GET_COURSES = "https://api.easi.utoronto.ca/ttb/getPageableCourses";

  static async fetch(options: UoftAdapterOptionsType): Promise<FormattedUoftCourseType[]> {
    options = this.getDefaultOptions(options);

    let body: any;
    if (options.method === "api") {
      body = await this.fetchAPI(options);
    } else if (options.method === "lambda") {
      body = await this.fetchLambda(options);
    }

    // if (!response.ok) {
    //   if (body.status[0].code === 4404) {
    //     return [];
    //   }

    //   throw new Error(`Error fetching courses: ${body.status[0].message}`);
    // }

    const courses: RawUoftCourseType[] = body.payload.pageableCourse.courses;
    return courses.map((course) => UoftFormatter.formatCourse(course));
  }

  private static async fetchAPI(options: UoftAdapterAPIOptionsType): Promise<any> {
    const apiOptions = this.getAPIOptions(options);

    Logger.info("Fetching courses via API");

    const response = await fetch(this.URL_GET_COURSES, {
      method: apiOptions.method,
      headers: apiOptions.headers,
      body: JSON.stringify(apiOptions.body),
    });

    // if (!response.ok) {
    //   return {

    //   }
    // }

    return await response.json();
  }

  private static async fetchLambda(options: UoftAdapterLambdaOptionsType): Promise<any> {
    const apiOptions = this.getAPIOptions(options);

    Logger.info(`Fetching courses via LAMBDA (${options.lambdaName})`);

    const body = await LambdaAdapter.invoke(options.lambdaName, {
      url: this.URL_GET_COURSES,
      method: apiOptions.method,
      headers: apiOptions.headers,
      body: JSON.stringify(apiOptions.body),
    });

    return body.data;
  }

  private static getDefaultOptions(options: UoftAdapterOptionsType): UoftAdapterOptionsType {
    return {
      query: options?.query || "",
      season: options?.season || "fall-winter",
      year: options?.year || this.getSchoolYear(),
      page: options?.page || 1,
      method: options?.method || "api",
      lambdaName: options?.lambdaName || "request-1",
    };
  }

  private static getAPIOptions(options: UoftAdapterOptionsType) {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: {
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
      },
    };
  }

  private static getSessions(options: UoftAdapterOptionsType): string[] {
    if (options.season === "fall-winter") {
      return [
        `${String(options.year)}9`,
        `${String(options.year + 1)}1`,
        `${String(options.year + 1)}9-${String(options.year + 1)}1`,
      ];
    }
    if (options.season === "summer") {
      return [
        `${String(options.year + 1)}5F`,
        `${String(options.year + 1)}5S`,
        `${String(options.year + 1)}5`,
      ];
    }

    throw new Error(`Invalid season option: ${options.season}`);
  }

  static getSchoolYear(date: Date = new Date()): number {
    const month = date.getMonth() + 1;

    // NOTE, may need to adjust this value in the future if it doesn't occur in the same time (10 seems like the next candidate)
    if (month >= 9) {
      return date.getFullYear();
    } else {
      return date.getFullYear() - 1;
    }
  }
}

export default UoftAdapter;

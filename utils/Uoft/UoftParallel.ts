import { FormattedUoftCourseType } from "@/Types/UoftTypes";
import alertsData from "@/data/alerts-data";

import UoftAdapter from "./UoftAdapter";

const { maxLambdas, maxLambdaRequests } = alertsData;

class UoftParallel {
  static updatedCourses: Record<string, FormattedUoftCourseType> = {};

  static async fetchAll(courseCodes: string[]): Promise<FormattedUoftCourseType[]> {
    let i = 0;
    while (i < courseCodes.length) {
      await this.fetchChunk(courseCodes.slice(i, i + maxLambdas * maxLambdaRequests));
      i += maxLambdas * maxLambdaRequests;
    }

    return Object.values(this.updatedCourses);
  }

  static async fetchChunk(courseCodes: string[]): Promise<void> {
    const requests: Promise<void>[][] = Array.from({ length: maxLambdas }, () => []);

    for (let i = 0; i < courseCodes.length; i++) {
      requests[i % maxLambdas].push(this.fetchSingle(courseCodes[i], (i % maxLambdas) + 1));
    }

    await Promise.allSettled(requests.flat());
  }

  static async fetchSingle(courseCode: string, lambdaNumber: number): Promise<void> {
    const courses = await UoftAdapter.fetch({
      query: courseCode,
      method: "lambda",
      lambdaName: `request-${lambdaNumber}`,
    });

    for (const course of courses) {
      this.updatedCourses[course.code] = course;
    }
  }
}

export default UoftParallel;

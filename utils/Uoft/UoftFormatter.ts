import { SectionTypeType, UoftCampusType, UoftTermType } from "@/Types/ModelTypes";
import {
  FormattedUoftCourseType,
  FormattedUoftSectionType,
  RawUoftCampusType,
  RawUoftCourseType,
  RawUoftSectionType,
  RawUoftTeachMethodType,
} from "@/Types/UoftTypes";

class UoftFormatter {
  static seasons = { 1: "winter", 5: "summer", 9: "fall" };
  static campuses: Record<RawUoftCampusType, UoftCampusType> = {
    Scarborough: "Scarborough",
    "University of Toronto at Mississauga": "Mississauga",
    "St. George": "St. George",
  };
  static sectionTypes: Record<RawUoftTeachMethodType, SectionTypeType> = {
    LEC: "lecture",
    TUT: "tutorial",
    LAB: "lab",
    PRA: "practical",
  };

  static formatCourse(courseData: RawUoftCourseType): FormattedUoftCourseType {
    return {
      name: courseData.name,
      slug: courseData.name.split(" ").join("-").toLowerCase(),
      code: this.formatCourseCode(courseData),
      school: "uoft",
      campus: this.formatCourseCampus(courseData),
      term: this.formatTerm(courseData),
      sections: courseData.sections.map((section) => this.formatSection(section)),
    };
  }

  static formatSection(sectionData: RawUoftSectionType): FormattedUoftSectionType {
    if (sectionData.tbaInd !== "N") {
      return {
        tba: true,
        type: this.sectionTypes[sectionData.teachMethod] || "other",
        number: sectionData.sectionNumber,
        school: "uoft",
        seatsTaken: null,
        seatsTotal: null,
        hasWaitlist: null,
        waitlistCount: null,
      };
    }

    return {
      tba: false,
      type: this.sectionTypes[sectionData.teachMethod] || "other",
      number: sectionData.sectionNumber,
      school: "uoft",
      seatsTaken: sectionData.maxEnrolment - sectionData.currentEnrolment,
      seatsTotal: sectionData.maxEnrolment,
      hasWaitlist: sectionData.waitlistInd === "Y",
      waitlistCount: sectionData.waitlistInd === "Y" ? sectionData.currentWaitlist : null,
    };
  }

  static formatCourseCode(courseData: RawUoftCourseType): string {
    return `${courseData.code} ${courseData.sectionCode}`;
  }

  static formatCourseCampus(courseData: RawUoftCourseType): UoftCampusType {
    return this.campuses[courseData.campus] || "other";
  }

  static formatSectionType(sectionData: RawUoftSectionType): SectionTypeType {
    return this.sectionTypes[sectionData.teachMethod] || "other";
  }

  static formatTerm(courseData: RawUoftCourseType): UoftTermType {
    const { sessions } = courseData;

    if (sessions.length === 2) {
      return "fall-winter";
    }

    const str = sessions[0];
    const season = this.seasons[str.at(4)];

    if (season === "summer") {
      if (courseData.sectionCode === "F") {
        return "summer-first";
      } else if (courseData.sectionCode === "S") {
        return "summer-second";
      } else {
        return "summer-full";
      }
    }

    return season;
  }
}

export default UoftFormatter;

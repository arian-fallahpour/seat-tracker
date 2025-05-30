class UoftFormatter {
  static seasons = { 1: "winter", 5: "summer", 9: "fall" };
  static campuses = {
    Scarborough: "Scarborough",
    "University of Toronto at Mississauga": "Mississauga",
    "St. George": "St. George",
  };
  static sectionTypes = {
    LEC: "lecture",
    TUT: "tutorial",
    LAB: "lab",
    PRA: "practical",
  };

  static formatCourse(courseData) {
    const sections = courseData.sections.map((sectionData) => this.formatSection(sectionData));

    return {
      name: courseData.name,
      code: this.formatCourseCode(courseData),
      term: this.formatTerm(courseData.sessions),
      campus: this.formatCampus(courseData.campus),
      sections,
    };
  }

  static formatCourseCode(courseData) {
    return `${courseData.code} ${courseData.sectionCode}`;
  }

  static formatSection(sectionData) {
    return {
      type: this.sectionTypes[sectionData.teachMethod] || "other",
      number: sectionData.sectionNumber,
      campus: this.formatCampus(sectionData.campus),
      seatsTaken: sectionData.currentEnrolment || 0,
      seatsAvailable: sectionData.maxEnrolment || 0,
      hasWaitlist: sectionData.waitlistInd === "Y" ? true : false,
      waitlist: sectionData.waitlistInd === "Y" ? sectionData.currentWaitlist : 0,
    };
  }

  static formatCampus(providedCampus) {
    return this.campuses[providedCampus] || null;
  }

  // ["20249", "20251"] (fall-winter)
  static formatTerm(sessions) {
    // Fall and Winter term
    if (sessions.length === 2) {
      return {
        year: Number(sessions[0].slice(0, 4)), // Starting year
        season: "fall-winter",
      };
    }

    const termData = sessions[0];
    const season = this.seasons[termData[4]];
    const year = Number(termData.slice(0, 4));

    // Summer term
    if (season === "summer") {
      // Sub summer session
      if (termData.length === 6) {
        return { year, season: `summer-${termData[5] === "F" ? "first" : "second"}` };
      }

      // Full summer session
      return { year, season: "summer-full" };
    }

    // Non-summer term
    return { year, season };
  }
}

module.exports = UoftFormatter;

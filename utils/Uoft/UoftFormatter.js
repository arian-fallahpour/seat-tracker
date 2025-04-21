class UoftFormatter {
  static seasons = { 1: "winter", 5: "summer", 9: "fall" };
  static campuses = {
    Scarborough: "Scarborough",
    "University of Toronto at Mississauga": "Mississauga",
    "St. George": "St. George",
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

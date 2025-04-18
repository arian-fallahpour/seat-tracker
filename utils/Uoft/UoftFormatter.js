class UoftFormatter {
  static seasons = { 1: "winter", 5: "summer", 9: "fall" };
  static campuses = {
    Scarborough: "Scarborough",
    "University of Toronto at Mississauga": "Mississauga",
    "St. George": "St. George",
  };

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
}

module.exports = UoftFormatter;

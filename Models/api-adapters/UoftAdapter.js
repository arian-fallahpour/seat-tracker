const axios = require("axios");

const getCoursesURL = "https://api.easi.utoronto.ca/ttb/getPageableCourses";

class UoftAdapter {
  // Returns formatted course data from Uoft timetable API
  static async getCourses({ query = "", page = 1 }) {
    const { data } = await axios({
      url: getCoursesURL,
      method: "POST",
      data: this.getBody({ query, page }),
    });

    const coursesData = data.payload.pageableCourse.courses;
    const courses = coursesData.map((courseData) =>
      this.formatCourse(courseData)
    );

    return courses;
  }

  // Formats course to database course schema
  static formatCourse(courseData) {
    const sections = courseData.sections.map((sectionData) =>
      this.formatSection({ ...sectionData, campus: courseData.campus })
    );

    return {
      school: "uoft",
      name: courseData.name,
      code: `${courseData.code} ${courseData.sectionCode}`,
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

  // Returns body associated with Uoft API request
  static getBody({ query = "", page = 1 }) {
    return {
      courseCodeAndTitleProps: {
        courseCode: "",
        courseTitle: query,
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
      divisions: [
        "APSC",
        "ARTSC",
        "FIS",
        "FPEH",
        "MUSIC",
        "ARCLA",
        "ERIN",
        "SCAR",
      ],
      creditWeights: [],
      availableSpace: false,
      waitListable: false,
      page,
      pageSize: 20,
      direction: "asc",
    };
  }
}

module.exports = UoftAdapter;

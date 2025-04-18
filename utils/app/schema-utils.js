exports.validateSeatsTaken = function (value) {
  return value <= this.seatsAvailable;
};

exports.calculateEmptySeats = function () {
  return this.seatsAvailable - this.seatsTaken;
};

exports.upsertCoursesAndSections = upsertCoursesAndSections;
function upsertCoursesAndSections(CourseModel, SectionModel) {
  return async function (coursesData) {
    const coursesDataMap = new Map();
    coursesData.forEach((courseData) => coursesDataMap.set(courseData.code, courseData));

    // Upsert courses
    const courses = await upsertCourses(CourseModel)(coursesData);

    // Gather data of all sections in all courses
    const sectionsData = [];
    for (const course of courses) {
      const courseData = coursesDataMap.get(course.code);
      const courseSections = courseData.sections.map((s) => ({ ...s, course: course.id }));
      sectionsData.push(...courseSections);
    }

    // Upsert sections
    const sections = await upsertSections(SectionModel)(sectionsData);

    // Create a map for the sections based on the course they belong to
    const sectionsMap = generateSectionsMap(sections);

    // Fill sections array for every upserted course with its corresponding upserted section
    for (const course of courses) {
      const currentSections = sectionsMap.get(course.id);
      const currentSectionsIds = currentSections.map((currentSection) => currentSection.id);
      course.sections = currentSectionsIds;
    }

    // Save courses
    await CourseModel.bulkSave(courses);

    return courses;
  };
}

exports.upsertCourses = upsertCourses;
function upsertCourses(CourseModel) {
  return async function (coursesData) {
    const bulkOperations = [];

    // Generate bulk operations for each course
    for (const courseData of coursesData) {
      const filter = { code: courseData.code };
      const update = { ...courseData, sections: [] };
      bulkOperations.push({ updateOne: { filter, update, upsert: true } });
    }

    // Upsert courses in bulk
    if (bulkOperations.length === 0) return [];
    await CourseModel.bulkWrite(bulkOperations);

    // Return all courses
    const courseCodes = coursesData.map((courseData) => courseData.code);
    const upsertedCourses = await CourseModel.find({ code: { $in: courseCodes } });
    return upsertedCourses;
  };
}

exports.upsertSections = upsertSections;
function upsertSections(SectionModel) {
  return async function (sectionsData) {
    const bulkOperations = [];
    const filters = { course: [], type: [], number: [] };

    // Generate bulk operations for each section
    for (const sectionData of sectionsData) {
      const filter = {
        course: sectionData.course,
        type: sectionData.type,
        number: sectionData.number,
      };
      filters.course.push(filter.course);
      filters.type.push(filter.type);
      filters.number.push(filter.number);
      bulkOperations.push({ updateOne: { filter, update: sectionData, upsert: true } });
    }

    // Upsert sections in bulk
    if (bulkOperations.length === 0) return [];
    await SectionModel.bulkWrite(bulkOperations);

    // Return all sections
    const upsertedSections = await SectionModel.find({
      course: { $in: filters.course },
      type: { $in: filters.type },
      number: { $in: filters.number },
    });

    return upsertedSections;
  };
}

function generateSectionsMap(sections) {
  const sectionsMap = new Map();

  for (const section of sections) {
    const courseSections = sectionsMap.get(String(section.course));
    if (!courseSections) {
      sectionsMap.set(String(section.course), [section]);
    } else {
      courseSections.push(section);
    }
  }

  return sectionsMap;
}

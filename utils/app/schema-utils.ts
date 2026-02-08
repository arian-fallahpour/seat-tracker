import mongoose from "mongoose";
import { FormattedUoftCourseType, FormattedUoftSectionType } from "@/Types/UoftTypes";
import { HydratedCourseType, HydratedSectionType } from "@/Types/ModelTypes";

import CourseModel from "@/models/CourseModel";
import SectionModel from "@/models/SectionModel";

// NOTE: May override sections array in each course, so if updated sections is a subset of existing sections, be careful when using this function

type FormattedUoftSectionWithCourseType = FormattedUoftSectionType & {
  course: mongoose.Types.ObjectId;
};

export async function upsertCoursesAndSections(coursesData: FormattedUoftCourseType[]) {
  const courses = await upsertCourses(coursesData, false);

  const coursesDataMap = new Map(coursesData.map((courseData) => [courseData.code, courseData]));

  // Upsert sections
  const sectionsData: FormattedUoftSectionWithCourseType[] = [];
  for (const course of courses) {
    const courseData = coursesDataMap.get(course.code);

    const courseSections = courseData.sections.map((s) => ({ ...s, course: course._id }));
    sectionsData.push(...courseSections);
  }
  const sections = await upsertSections(sectionsData, false);

  // Map sections back to courses
  const sectionsMap = new Map<string, HydratedSectionType[]>();
  for (const section of sections) {
    const courseSections = sectionsMap.get(section.course.toString());

    if (courseSections === undefined) {
      sectionsMap.set(section.course.toString(), [section]);
    } else {
      courseSections.push(section);
    }
  }

  // Update courses with their sections
  for (const course of courses) {
    course.sections = sectionsMap.get(course._id.toString()).map((section) => section._id);
  }

  await CourseModel.bulkSave(courses);
  await SectionModel.bulkSave(sections);

  return courses;
}

export async function upsertCourses(
  coursesData: FormattedUoftCourseType[],
  shouldBulkSave = true,
): Promise<HydratedCourseType[]> {
  const bulkOperations = coursesData.map((courseData) => ({
    updateOne: {
      filter: { code: courseData.code },
      update: { ...courseData, sections: [] },
      upsert: true,
    },
  }));
  if (bulkOperations.length === 0) return [];

  await CourseModel.bulkWrite(bulkOperations);
  const upsertedCourses = await CourseModel.find({
    code: { $in: coursesData.map((c) => c.code) },
  });

  if (shouldBulkSave) {
    await CourseModel.bulkSave(upsertedCourses);
  }

  return upsertedCourses;
}

export async function upsertSections(
  sectionsData: (FormattedUoftSectionType & { course: mongoose.Types.ObjectId })[],
  shouldBulkSave = true,
): Promise<HydratedSectionType[]> {
  const bulkOperations = sectionsData.map((sectionData) => ({
    updateOne: {
      filter: {
        course: sectionData.course,
        type: sectionData.type,
        number: sectionData.number,
      },
      update: sectionData,
      upsert: true,
    },
  }));
  const filters = {
    course: sectionsData.map((s) => s.course),
    type: sectionsData.map((s) => s.type),
    number: sectionsData.map((s) => s.number),
  };
  if (bulkOperations.length === 0) return [];

  await SectionModel.bulkWrite(bulkOperations);

  const sections = await SectionModel.find({
    course: { $in: filters.course },
    type: { $in: filters.type },
    number: { $in: filters.number },
  });

  if (shouldBulkSave) {
    await SectionModel.bulkSave(sections);
  }

  return sections;
}

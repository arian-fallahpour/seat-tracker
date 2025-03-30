import * as crudController from "./crudController.js";
import Course from "../models/database/Course/Course.js";
import UoftCourse from "../models/database/Course/UoftCourse.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIQuery from "../utils/APIQuery.js";

export const searchForCourses = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  // Check if valid query was provided
  if (!query || query === "") {
    return next(new AppError("Please provide a valid query to search from.", 500));
  }

  // Find courses based on search input
  const searchQuery = UoftCourse.search(query).populate({ path: "sections", select: "type" });
  const courses = await new APIQuery(searchQuery, { limit: 5 }).paginate().execute();

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: {
      courses,
    },
  });
});

export const getCourseInfo = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  // Check if valid code was provided
  if (!slug || slug === "") {
    return next(new AppError("Please provide a valid slug to find the course.", 500));
  }

  // Find course using slug
  const course = await UoftCourse.findOne({ slug }).populate({
    path: "sections",
    select: "type number campus lastUpdatedAt",
  });
  if (!course) {
    return next(new AppError("Could not find course with provided slug.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});

export const getOneCourse = crudController.getOne(Course);
export const getAllCourses = crudController.getAll(Course);
export const createOneCourse = crudController.createOne(Course);
export const updateOneCourse = crudController.updateOne(Course);
export const deleteOneCourse = crudController.deleteOne(Course);

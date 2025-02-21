const crudController = require("./crudController");
const Course = require("../models/database/Course/Course");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIQuery = require("../utils/APIQuery");
const UoftCourse = require("../models/database/Course/UoftCourse");
const WaterlooCourse = require("../models/database/Course/WaterlooCourse");

const CourseModels = new Map();
CourseModels.set("uoft", UoftCourse);
CourseModels.set("waterloo", WaterlooCourse);

// TODO: Add for other courses too
exports.searchForCourses = catchAsync(async (req, res, next) => {
  const { school } = req.params;
  const { query } = req.query;

  // Check if valid school was provided
  if (!CourseModels.has(school)) {
    return new AppError("Please provide a valid school to search courses from.", 500);
  }

  // Check if valid query was provided
  if (!query || query === "") {
    return new AppError("Please provide a valid query to search from.", 500);
  }

  // Find courses based on search input
  const CourseModel = CourseModels.get(school);
  const searchQuery = CourseModel.search(query).populate({ path: "sections", select: "type" });
  const courses = await new APIQuery(searchQuery, { limit: 5 }).paginate().execute();

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: {
      courses,
    },
  });
});

exports.getCourseInfo = catchAsync(async (req, res, next) => {
  const { school, slug } = req.params;

  // Check if valid school was provided
  if (!CourseModels.has(school)) {
    return new AppError("Please provide a valid school to search courses from.", 500);
  }

  // Check if valid code was provided
  if (!slug || slug === "") {
    return new AppError("Please provide a valid slug to find the course.", 500);
  }

  // Find course using slug
  const CourseModel = CourseModels.get(school);
  const course = await CourseModel.findOne({ slug }).populate({
    path: "sections",
    select: "type number campus lastUpdatedAt",
  });
  if (!course) {
    return new AppError("Could not find course with provided slug.", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});

exports.getOneCourse = crudController.getOne(Course);
exports.getAllCourses = crudController.getAll(Course);
exports.createOneCourse = crudController.createOne(Course);
exports.updateOneCourse = crudController.updateOne(Course);
exports.deleteOneCourse = crudController.deleteOne(Course);

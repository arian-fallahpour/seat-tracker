const crudController = require("./crudController");
const Course = require("../models/database/Course/Course");
const UoftCourse = require("../models/database/Course/UoftCourse");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIQuery = require("../utils/APIQuery");

exports.searchForCourses = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  // return next(new AppError("test", 400));

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

exports.getCourseInfo = catchAsync(async (req, res, next) => {
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

exports.getOneCourse = crudController.getOne(Course);
exports.getAllCourses = crudController.getAll(Course);
exports.createOneCourse = crudController.createOne(Course);
exports.updateOneCourse = crudController.updateOne(Course);
exports.deleteOneCourse = crudController.deleteOne(Course);

const catchAsync = require("../utils/app/catchAsync");
const AppError = require("../utils/app/AppError");
const APIQuery = require("../utils/app/APIQuery");
const crudController = require("./crudController");
const CourseModel = require("../models/Course/CourseModel");
const UoftCourseModel = require("../models/Course/UoftCourseModel");
const TermModel = require("../models/Course/TermModel");

exports.searchForCourses = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  // Check if any enrollments are open
  const enrollableSeasons = TermModel.getEnrollableSeasons();
  if (enrollableSeasons.length === 0) {
    return next(new AppError("Enrollment is not currently open, please try again later.", 400));
  }

  // Check if valid query was provided
  if (!query || query === "") {
    return next(new AppError("Please provide a valid query to search from.", 400));
  }

  // Find courses based on search input
  const searchQuery = UoftCourseModel.search(query).populate({ path: "sections", select: "type" });
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
  const course = await UoftCourseModel.findOne({ slug }).populate({
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

exports.getOneCourse = crudController.getOne(CourseModel);
exports.getAllCourses = crudController.getAll(CourseModel);
exports.createOneCourse = crudController.createOne(CourseModel);
exports.updateOneCourse = crudController.updateOne(CourseModel);
exports.deleteOneCourse = crudController.deleteOne(CourseModel);

const crudController = require("./crudController");
const Course = require("../models/database/Course/Course");
const UoftCourse = require("../models/database/Course/UoftCourse");
const UoftSection = require("../models/database/Section/UoftSection");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIQuery = require("../utils/APIQuery");
const enums = require("../data/enums");

exports.searchForCourses = catchAsync(async (req, res, next) => {
  const { school } = req.params;
  const { search } = req.query;

  // Check if school if valid
  if (!enums.schools.includes(school)) {
    return next(new AppError("Please provide a valid school to search from.", 400));
  }

  // Find courses based on search input
  const regex = new RegExp(`^${search}`, "gi");
  const query = Course.find({ $or: [{ code: regex }, { name: regex }] });
  const courses = await new APIQuery(query, { limit: 5 }).paginate().execute();

  res.status(200).json({
    status: "success",
    results: courses.length,
    data: {
      courses,
    },
  });
});

exports.getOneCourse = crudController.getOne(Course);
exports.getAllCourses = crudController.getAll(Course);
exports.createOneCourse = crudController.createOne(Course);
exports.updateOneCourse = crudController.updateOne(Course);
exports.deleteOneCourse = crudController.deleteOne(Course);

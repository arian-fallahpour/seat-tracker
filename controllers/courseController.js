const crudController = require("./crudController");
const Course = require("../Models/database/courseModel");
const catchAsync = require("../utils/catchAsync");
const enums = require("../data/enums");
const AppError = require("../utils/AppError");

exports.searchForCourses = catchAsync(async (req, res, next) => {
  const { school } = req.params;
  const { search } = req.query;

  console.log(school, search);

  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  // Check if school if valid
  if (!enums.schools.includes(school)) {
    return next(
      new AppError("Please provide a valid school to search from.", 400)
    );
  }

  // TODO: May not be correct syntax
  // Find courses based on search input
  const regex = new RegExp(`^${search}`, "gi");
  const courses = await Course.find({
    $or: [{ code: regex }, { name: regex }],
  }).limit(5);

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

const crudController = require("./crudController");
const Course = require("../models/database/Course/Course");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIQuery = require("../utils/APIQuery");
const UoftCourse = require("../models/database/Course/UoftCourse");

// TODO: Add for other courses too
exports.searchForCourses = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  // Find courses based on search input
  const searchTerm = new RegExp(`^${search}`, "gi");
  const query = UoftCourse.find({ $or: [{ code: searchTerm }, { name: searchTerm }] }).populate({
    path: "sections",
    select: "type",
  });
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

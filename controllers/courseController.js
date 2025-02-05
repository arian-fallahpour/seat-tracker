const crudController = require("./crudController");
const Course = require("../Models/courseModel");

exports.getOneCourse = crudController.getOne(Course);
exports.getAllCourses = crudController.getAll(Course);
exports.createOneCourse = crudController.createOne(Course);
exports.updateOneCourse = crudController.updateOne(Course);
exports.deleteOneCourse = crudController.deleteOne(Course);

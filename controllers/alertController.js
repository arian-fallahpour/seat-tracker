const crudController = require("./crudController");
const Alert = require("../Models/database/alertModel");
const catchAsync = require("../utils/catchAsync");

exports.createCourseAlert = catchAsync(async (req, res, next) => {});

exports.getOneAlert = crudController.getOne(Alert);
exports.getAllAlerts = crudController.getAll(Alert);
exports.createOneAlert = crudController.createOne(Alert);
exports.updateOneAlert = crudController.updateOne(Alert);
exports.deleteOneAlert = crudController.deleteOne(Alert);

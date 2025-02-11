const crudController = require("./crudController");
const Alert = require("../models/database/Alert");
const catchAsync = require("../utils/catchAsync");

exports.createCourseAlert = catchAsync(async (req, res, next) => {});

exports.getOneAlert = crudController.getOne(Alert);
exports.getAllAlerts = crudController.getAll(Alert);
exports.createOneAlert = crudController.createOne(Alert);
exports.updateOneAlert = crudController.updateOne(Alert);
exports.deleteOneAlert = crudController.deleteOne(Alert);

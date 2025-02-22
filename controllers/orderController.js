const crudController = require("./crudController");
const Order = require("../models/database/Order");
const catchAsync = require("../utils/catchAsync");

exports.createCheckoutSession = catchAsync(async (req, res, next) => {});

exports.getOneOrder = crudController.getOne(Order);
exports.getAllOrders = crudController.getAll(Order);
exports.createOneOrder = crudController.createOne(Order);
exports.updateOneOrder = crudController.updateOne(Order);
exports.deleteOneOrder = crudController.deleteOne(Order);

const crudController = require("./crudController");
const Order = require("../models/database/orderModel");

exports.getOneOrder = crudController.getOne(Order);
exports.getAllOrders = crudController.getAll(Order);
exports.createOneOrder = crudController.createOne(Order);
exports.updateOneOrder = crudController.updateOne(Order);
exports.deleteOneOrder = crudController.deleteOne(Order);

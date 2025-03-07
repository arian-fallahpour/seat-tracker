const crudController = require("./crudController");
const Alert = require("../models/database/Alert");

exports.getOneAlert = crudController.getOne(Alert);
exports.getAllAlerts = crudController.getAll(Alert);
exports.createOneAlert = crudController.createOne(Alert);
exports.updateOneAlert = crudController.updateOne(Alert);
exports.deleteOneAlert = crudController.deleteOne(Alert);

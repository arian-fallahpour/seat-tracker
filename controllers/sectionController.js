const crudController = require("./crudController");
const Section = require("../Models/database/sectionModel");

exports.getOneSection = crudController.getOne(Section);
exports.getAllSections = crudController.getAll(Section);
exports.createOneSection = crudController.createOne(Section);
exports.updateOneSection = crudController.updateOne(Section);
exports.deleteOneSection = crudController.deleteOne(Section);

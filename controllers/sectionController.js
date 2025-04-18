const crudController = require("./crudController");
const SectionModel = require("../models/Section/SectionModel");

exports.getOneSection = crudController.getOne(SectionModel);
exports.getAllSections = crudController.getAll(SectionModel);
exports.createOneSection = crudController.createOne(SectionModel);
exports.updateOneSection = crudController.updateOne(SectionModel);
exports.deleteOneSection = crudController.deleteOne(SectionModel);

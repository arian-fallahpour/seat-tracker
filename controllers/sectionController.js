const crudController = require("./crudController");
const schemaController = require("./schemaController");

const Section = require("../models/database/Section/Section");
const UoftSection = require("../models/database/Section/UoftSection");

exports.upsertUoftSections = schemaController.upsertSections(UoftSection);

exports.getOneSection = crudController.getOne(Section);
exports.getAllSections = crudController.getAll(Section);
exports.createOneSection = crudController.createOne(Section);
exports.updateOneSection = crudController.updateOne(Section);
exports.deleteOneSection = crudController.deleteOne(Section);

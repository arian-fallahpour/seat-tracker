import * as crudController from "./crudController.js";
import Section from "../models/database/Section/Section.js";

export const getOneSection = crudController.getOne(Section);
export const getAllSections = crudController.getAll(Section);
export const createOneSection = crudController.createOne(Section);
export const updateOneSection = crudController.updateOne(Section);
export const deleteOneSection = crudController.deleteOne(Section);

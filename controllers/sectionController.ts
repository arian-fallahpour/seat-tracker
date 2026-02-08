import * as crudController from "./crudController";
import SectionModel from "../models/SectionModel";

export const getOneSection = crudController.getOne(SectionModel);
export const getAllSections = crudController.getAll(SectionModel);
export const createOneSection = crudController.createOne(SectionModel);
export const updateOneSection = crudController.updateOne(SectionModel);
export const deleteOneSection = crudController.deleteOne(SectionModel);

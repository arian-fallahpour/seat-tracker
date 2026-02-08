import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import catchAsync from "../utils/app/catchAsync";
import AppError from "../utils/app/AppError";
import APIQuery from "../utils/app/APIQuery";

export const getOne = (Model: mongoose.Models[0]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError(`No ${Model.modelName.toLowerCase()} found with that id.`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });

export const getAll = (Model: mongoose.Models[0]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const apiQuery = new APIQuery(Model.find(), req.query).filter().sort().select().paginate();
    const documents = await apiQuery.execute();

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        [Model.modelName.toLowerCase() + "s"]: documents,
      },
    });
  });

export const createOne = (Model: mongoose.Models[0]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });

export const updateOne = (Model: mongoose.Models[0]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError(`No ${Model.modelName.toLowerCase()} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });

export const deleteOne = (Model: mongoose.Models[0]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError(`No ${Model.modelName.toLowerCase()} found with that id.`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

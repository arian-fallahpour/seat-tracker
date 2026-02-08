import { NextFunction, Request, Response } from "express";
import { CourseMethodsType, CourseType } from "@/Types/ModelTypes";

import CourseModel from "../models/CourseModel";
import * as crudController from "./crudController";

import catchAsync from "../utils/app/catchAsync";
import AppError from "../utils/app/AppError";
import APIQuery from "../utils/app/APIQuery";

export const searchForCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.query as string;

    const enrollableSeasons = CourseModel.getEnrollableTerms("uoft");

    if (enrollableSeasons.length === 0)
      return next(new AppError("Enrollment is not currently open, please try again later.", 400));
    if (!query || query === "")
      return next(new AppError("Please provide a valid query to search from.", 400));

    const cleanQuery = query.trim().replace(/[^a-z0-9]/gi, "");
    const searchQuery = CourseModel.search("uoft", cleanQuery).populate({
      path: "sections",
      select: ["type", "number", "campus", "lastUpdatedAt"],
    });
    const courses = await new APIQuery<CourseType, CourseMethodsType>(searchQuery, { limit: 5 })
      .paginate()
      .execute();

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: { courses },
    });
  },
);

export const getCourseInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  if (!slug || slug === "")
    return next(new AppError("Please provide a valid slug to find the course.", 500));

  const course = await CourseModel.findOne({ slug }).populate({
    path: "sections",
    select: "type number campus lastUpdatedAt",
  });
  if (!course) return next(new AppError("Could not find course with provided slug.", 404));

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});

export const getOneCourse = crudController.getOne(CourseModel);
export const getAllCourses = crudController.getAll(CourseModel);
export const createOneCourse = crudController.createOne(CourseModel);
export const updateOneCourse = crudController.updateOne(CourseModel);
export const deleteOneCourse = crudController.deleteOne(CourseModel);

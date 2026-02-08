import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app/AppError";
import catchAsync from "../utils/app/catchAsync";
import { get404Message } from "../utils/helper-server";

/**
 * Only allows access to route if in development, otherwise throws 404 error
 */

export const restrictToDevOnly = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "development") {
      return next();
    }

    return next(new AppError(get404Message(req.originalUrl), 404));
  },
);

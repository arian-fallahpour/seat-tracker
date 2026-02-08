import { NextFunction, Request, Response } from "express";

import AppError from "../utils/app/AppError";
import Logger from "../utils/Logger";
import mongoose from "mongoose";

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error.js";

  if (error.name === "CastError") return handleCastError();
  if (error.name === "ValidationError") return handleValidationError(error);
  if (error.code === 11000) return handleDuplicateKeyError(error);

  if (process.env.NODE_ENV === "development") {
    console.error(error);

    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack.split("\n"),
    });
  }

  if (!error.isOperational) {
    Logger.error(`Non-operational error: ${error.message}`, { error });

    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

export default errorHandler;

function handleCastError() {
  return new AppError("Please provide a valid id.", 400);
}

function handleDuplicateKeyError(error: any) {
  const keys = Object.keys(error.keyPattern);

  let message: string;
  if (keys.length > 1) {
    const last = keys.pop();
    const rest = keys.join(", ");
    message = `Please provide a different set of values for ${rest} and ${last}.`;
  } else {
    message = `Please provide a different value for ${keys[0]}.`;
  }

  return new AppError(message, 400);
}

function handleValidationError(error: mongoose.Error.ValidationError) {
  return new AppError(error.errors[0].message, 400);
}

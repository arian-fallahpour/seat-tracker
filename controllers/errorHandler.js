const AppError = require("../utils/app/AppError");
const Logger = require("../utils/Logger");

const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error.js";

  // Send development error
  if (process.env.NODE_ENV === "development") {
    return handleDevError(error, res);
  }

  // Send production error
  return handleProdError(error, res);
};
module.exports = errorHandler;

function handleDevError(error, res) {
  error = handleKnownErrors(error);

  console.error(error);

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack.split("\n"),
  });
}

function handleProdError(error, res) {
  error = handleKnownErrors(error);

  // Return no error data if not operational
  if (!error.isOperational) {
    Logger.error(`Non-operational error: ${error.message}`, { error });

    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }

  // Return simple data if operational
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
}

function handleKnownErrors(error) {
  if (error.name === "CastError") return handleCastError();
  if (error.name === "ValidationError") return handleValidationError(error);
  if (error.code === 11000) return handleDuplicateKeyError(error);
  return error;
}

function handleCastError() {
  return new AppError("Please provide a valid id.", 400);
}

function handleDuplicateKeyError(error) {
  const keys = Object.keys(error.keyPattern);

  let message;
  if (keys.length > 1) {
    const last = keys.pop();
    const rest = keys.join(", ");
    message = `Please provide a different set of values for ${rest} and ${last}.`;
  } else {
    message = `Please provide a different value for ${keys[0]}.`;
  }

  return new AppError(message, 400);
}

function handleValidationError(error) {
  error = Object.values(error.errors)[0];

  if (error.name === "CastError") return handleCastError(error);
  return new AppError(error.message, 400);
}

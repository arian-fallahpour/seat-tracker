const AppError = require("../utils/AppError");

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
  console.error(error);

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack.split("\n"),
  });
}

function handleProdError(error, res) {
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.code === 11000) error = handleDuplicateKeyError(error);

  // Return simple data if operational
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Return no error data if not operational
  return res.status(500).json({
    status: "error",
    message: "Something went wrong.",
  });
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

function handleCastError(error) {
  const errors = Object.values(error.errors);
  const key = errors[0].path;

  return new AppError(`Please provide a valid ${key}.`, 400);
}

const AppError = require("../utils/app/AppError");
const catchAsync = require("../utils/app/catchAsync");
const { get404Message } = require("../utils/helper-server");

/**
 * Only allows access to route if in development, otherwise throws 404 error
 */

exports.restrictToDevOnly = catchAsync(async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  return next(new AppError(get404Message(req.originalUrl), 404));
});

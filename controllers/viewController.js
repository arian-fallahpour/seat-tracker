const next = require("next");
const catchAsync = require("../utils/catchAsync");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });

exports.getHome = catchAsync(async (req, res, next) => {
  nextApp.render(req, res, "/");
});

const catchAsync = require("../utils/app/catchAsync");
const AppError = require("../utils/app/AppError");
const APIQuery = require("../utils/app/APIQuery");

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
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

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
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

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
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

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError(`No ${Model.modelName.toLowerCase()} found with that id.`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

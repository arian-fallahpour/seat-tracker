import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError(`No ${Model.modelName} found with that id.`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [Model.modelName]: document,
      },
    });
  });

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const documents = await Model.find();

    // const features = new APIFeatures(Model.find(filter), req.query)
    //   .filter()
    //   .sort()
    //   .limitFields()
    //   .paginate();

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        [Model.modelName + "s"]: documents,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [Model.modelName]: document,
      },
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError(`No ${Model.modelName} found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        [Model.modelName]: document,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError(`No ${Model.modelName} found with that id.`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

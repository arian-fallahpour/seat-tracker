import mongoose, { model, Schema } from "mongoose";

import { LogType } from "@aws-sdk/client-lambda";
import { loggerTypeValues, LogMethodsType, LogModelType } from "@/Types/ModelTypes";

const logSchema = new Schema<LogType, LogModelType, LogMethodsType>({
  type: {
    type: String,
    required: [true, "Please provide a log type."],
    enum: {
      values: loggerTypeValues,
      message: "Please provide a valid log type.",
    },
  },
  message: {
    type: String,
    required: [true, "Please provide a log message."],
  },
  data: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LogModel =
  (mongoose.models.Log as LogModelType) || model<LogType, LogModelType>("Log", logSchema);

export default LogModel;

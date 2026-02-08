import { LoggerType } from "@/Types/ModelTypes";

import LogModel from "../models/LogModel";

class Logger {
  static documentableLogs = ["log", "warn", "error"];

  static info(message: string, data?: any) {
    this.emit("info", message, data);
  }

  static log(message: string, data?: any) {
    this.emit("log", message, data);
  }

  static warn(message: string, data?: any) {
    this.emit("warn", message, data);
  }

  static error(message: string, data?: any) {
    this.emit("error", message, data);
  }

  static emit(type: LoggerType, message: string, data: any = null) {
    let method = "error";
    if (type === "info" || type === "log" || type === "alert") method = "log";
    if (type === "warn") method = "warn";
    console[method](`[${type.toUpperCase()}] ${message}`);

    if (this.documentableLogs.includes(type)) {
      LogModel.create({ type, message, data });
    }
  }
}

export default Logger;

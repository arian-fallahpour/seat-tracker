const LogModel = require("../models/LogModel");

class Logger {
  static documentableLogs = ["log", "warn", "error"];

  static info(message, data) {
    this.emit("info", message, data);
  }

  static log(message, data) {
    this.emit("log", message, data);
  }

  static warn(message, data) {
    this.emit("warn", message, data);
  }

  static error(message, data) {
    this.emit("error", message, data);
  }

  static announce(message) {
    this.emit("announce", message);
  }

  static emit(type, message, data) {
    let method = "error";
    if (type === "info" || type === "log" || type === "announce" || type === "alert")
      method = "log";
    if (type === "warn") method = "warn";
    console[method](`[${type.toUpperCase()}] ${message}`);

    if (this.documentableLogs.includes(type)) {
      LogModel.create({ type, message, data });
    }
  }
}

module.exports = Logger;

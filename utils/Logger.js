const LogModel = require("../models/LogModel");

class Logger {
  static documentableLogs = ["log", "warn", "error"];

  static info(description, data) {
    this.emit("info", description, data);
  }

  static log(description, data) {
    this.emit("log", description, data);
  }

  static warn(description, data) {
    this.emit("warn", description, data);
  }

  static error(description, data) {
    this.emit("error", description, data);
  }

  static announce(message) {
    this.emit("announce", message);
  }

  static emit(type, description, data) {
    let method = "error";
    if (type === "info" || type === "log" || type === "announce" || type === "alert")
      method = "log";
    if (type === "warn") method = "warn";
    console[method](`[${type.toUpperCase()}] ${description}`);

    if (this.documentableLogs.includes(type)) {
      LogModel.create({ type, description, data });
    }
  }
}

module.exports = Logger;

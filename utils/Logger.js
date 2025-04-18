const LogModel = require("../models/LogModel");

class Logger {
  static async info(description, data) {
    this.emit("info", description, data);
  }

  static async warning(description, data) {
    this.emit("warning", description, data);
  }
  static async error(description, data) {
    this.emit("error", description, data);
  }
  static async alert(description, data) {
    this.emit("alert", description, data);
  }

  static async emit(type, description, data) {
    if (process.env.NODE_ENV !== "production") {
      let method = "error";
      if (type === "info") method = "log";
      if (type === "warning") method = "warn";
      console[method](`[${type.toUpperCase()}] ${description}`);
    }

    await LogModel.create({ type, description, data });
  }

  /**
   * Logs message in all environments
   */
  static announce(message) {
    console.log(`[LOG] ${message}`);
  }
}

module.exports = Logger;

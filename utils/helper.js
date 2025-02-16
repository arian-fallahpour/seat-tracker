exports.sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.join = (...classes) => classes.join(" ").trim();

export const sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const join = (...classes) => classes.join(" ").trim();

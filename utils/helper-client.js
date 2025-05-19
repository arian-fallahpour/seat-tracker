import businessData from "../data/business-data.js";

export const sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getPageHeader = (title) => {
  if (!title) {
    return businessData.name;
  }

  return `${businessData.name} - ${title}`;
};

export const join = (...classes) => classes.join(" ").trim();

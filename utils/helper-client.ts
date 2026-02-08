import businessData from "../data/business-data";

export const sleep = function (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getPageHeader = (title: string) => {
  if (!title) {
    return businessData.name;
  }

  return `${businessData.name} - ${title}`;
};

export const join = (...classes) => classes.join(" ").trim();

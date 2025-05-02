import businessData from "../data/business-data";

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

export const removeParam = (searchParams, router, key) => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(key);

  const newUrl = params.toString() ? `?${params.toString()}` : "/";
  router.replace(newUrl);
};

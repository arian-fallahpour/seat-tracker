import { headers } from "next/headers";

export const sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const join = (...classes) => classes.join(" ").trim();

const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

export const createURL = async (relativeURL) => {
  // const header = await headers();
  // const host = header.get("host");
  // console.log(header.get("host"));

  const host = "localhost:8080"; // TODO: Fix (hardcoded)

  return `${protocol}://${host}${relativeURL}`;
};

export const createServerURL = async (relativeURL) => {
  // const header = await headers();
  // const host = header.get("host");
  const host = process.env.NODE_ENV === "development" ? "localhost:8080" : "";
};

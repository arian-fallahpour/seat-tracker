import { headers } from "next/headers";

export const createServerURL = async (relativeURL: string) => {
  const protocol =
    process.env.NODE_ENV === "development" || process.env.HOST === "localhost" ? "http" : "https";

  const header = await headers();
  const host =
    process.env.NODE_ENV === "development" ? `localhost:${process.env.PORT}` : header.get("host");

  return `${protocol}://${host}${relativeURL}`;
};

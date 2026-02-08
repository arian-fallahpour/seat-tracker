import React, { FC } from "react";
import ReactDOMServer from "react-dom/server";

import { convert } from "html-to-text";
import mongoose from "mongoose";
import xss from "xss";

export const connectToDB = async () => {
  const dbUri = process.env.MONGODB_URI || process.env.AZURE_COSMOS_CONNECTIONSTRING;
  await mongoose.connect(dbUri, { autoIndex: true });
};

export const jsxToHtml = function (Component: FC, props: any) {
  const element = React.createElement(Component, props, null);
  return ReactDOMServer.renderToString(element);
};

export const jsxToText = function (Component: FC, props: any) {
  const element = React.createElement(Component, props, null);
  const string = ReactDOMServer.renderToString(element);
  return convert(string, { wordwrap: 130 });
};

export const get404Message = (originalUrl) => `The route ${originalUrl} does not exist.`;

export const sanitizeObjectXSS = function (obj) {
  const result = {};
  for (const key in obj) {
    result[key] = xss(obj[key]);
  }
  return result;
};

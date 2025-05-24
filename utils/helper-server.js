const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { headers } = require("next/headers");
const { convert } = require("html-to-text");
const mongoose = require("mongoose");
const crypto = require("crypto");

exports.connectToDB = async () => {
  const dbUri = process.env.MONGODB_URI || process.env.AZURE_COSMOS_CONNECTIONSTRING;
  await mongoose.connect(dbUri, { autoIndex: true });
};

exports.createServerURL = async (relativeURL) => {
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const header = await headers();
  const host =
    process.env.NODE_ENV === "development" ? `localhost:${process.env.PORT}` : header.get("host");

  return `${protocol}://${host}${relativeURL}`;
};

exports.jsxToHtml = function (Component, props) {
  const element = React.createElement(Component, props, null);
  return ReactDOMServer.renderToString(element);
};

exports.jsxToText = function (Component, props) {
  const element = React.createElement(Component, props, null);
  const string = ReactDOMServer.renderToString(element);
  return convert(string, { wordwrap: 130 });
};

exports.get404Message = (originalUrl) => `The route ${originalUrl} does not exist.`;

exports.encryptCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

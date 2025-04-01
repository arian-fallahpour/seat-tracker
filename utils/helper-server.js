const mongoose = require("mongoose");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const reactToText = require("react-to-text");
const archiver = require("archiver");
const { headers } = require("next/headers");
const fs = require("fs");

exports.createServerURL = async (relativeURL) => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const header = await headers();
  const host =
    process.env.NODE_ENV === "development" ? `localhost:${process.env.PORT}` : header.get("host");

  return `${protocol}://${host}/${relativeURL}`;
};

exports.fileToZipBuffer = function (filePath) {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks = [];

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    archive.append(fs.createReadStream(filePath), { name: require("path").basename(filePath) });
    archive.finalize();
  });
};

exports.jsxToHtml = function (Component, props) {
  const element = React.createElement(Component, props, null);
  return ReactDOMServer.renderToString(element);
};

exports.jsxToText = function (Component, props) {
  const element = React.createElement(Component, props, null);
  return reactToText(element);
};

exports.connectToDB = async function () {
  let dbUri = process.env.DATABASE_CONNECTION;
  dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  await mongoose.connect(dbUri, { autoIndex: true });
};

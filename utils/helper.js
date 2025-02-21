const fs = require("fs");
const archiver = require("archiver");

exports.sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.join = (...classes) => classes.join(" ").trim();

exports.createURL = async (relativeURL) => {
  // const header = await headers();
  // const host = header.get("host");
  const host = "localhost:8080"; // TODO: Fix (hardcoded)
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  return `${protocol}://${host}${relativeURL}`;
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

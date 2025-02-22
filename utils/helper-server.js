const fs = require("fs");
const archiver = require("archiver");

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

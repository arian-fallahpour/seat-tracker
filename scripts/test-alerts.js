require("@babel/register");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const { connectToDB } = require("../utils/helper-server");

const UoftCourseModel = require("../models/Course/UoftCourseModel");
const UoftSectionModel = require("../models/Section/UoftSectionModel");
const fsp = require("fs/promises");
const path = require("path");

(async () => {
  // Connect to database
  await connectToDB();
  console.log("Database connection successful");

  const filePath = path.join(__dirname, "../ignore/db-import/test.sections.json");
  const documentsJSON = await fsp.readFile(filePath, "utf-8");
  const documents = JSON.parse(documentsJSON).map(convertMongoTypes);

  const batchSize = 300;
  for (let i = 0; i < documents.length; i += batchSize) {
    try {
      const batch = documents.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} (${batch.length} documents)...`);
      await UoftSectionModel.insertMany(batch, { ordered: false });
      console.log(`Batch ${i / batchSize + 1} processed.`);
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize + 1}:`, error);
    }

    // To avoid overwhelming the database, you might want to add a small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 500ms delay
  }

  process.exit();
})();

function convertMongoTypes(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertMongoTypes);
  } else if (obj && typeof obj === "object") {
    // $oid
    if (Object.keys(obj).length === 1 && obj.$oid) {
      return obj.$oid;
    }
    // $date
    if (Object.keys(obj).length === 1 && obj.$date) {
      return new Date(obj.$date);
    }
    // Otherwise, recursively process all properties
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertMongoTypes(obj[key]);
    }
    return newObj;
  }
  return obj;
}

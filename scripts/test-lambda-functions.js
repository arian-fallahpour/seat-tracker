const dotenv = require("dotenv");
const path = require("path");

const LambdaAdapter = require("../models/api-adapters/LambdaAdapter");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");

dotenv.config({ path: "./config.env" });

const functionName = "axios-request";

(async () => {
  // Update function
  try {
    const functionFilePath = path.resolve(__dirname, `../aws/lambdas/${functionName}/index.js`);
    await LambdaAdapter.update("axios-request", functionFilePath);
  } catch (error) {
    console.error(error);
  }

  // Invoke function
  try {
    const payload = { options: UoftAdapter.getFetchOptions({}) };
    const response = await LambdaAdapter.invokeLambdaFunction(functionName, payload);
    console.log(response);
  } catch (error) {
    console.error(error);
  }

  process.exit();
})();

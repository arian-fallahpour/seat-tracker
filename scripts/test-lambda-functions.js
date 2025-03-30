import dotenv from "dotenv";
import path from "path";

import LambdaAdapter from "../models/api-adapters/LambdaAdapter.js";
import UoftAdapter from "../models/api-adapters/UoftAdapter.js";

dotenv.config({ path: "./config.env" });

const functionName = "axios-request";

(async () => {
  // Update function
  try {
    const functionFilePath = path.resolve(__dirname, `../aws/lambdas/${functionName}/index.js`);
    await LambdaAdapter.updateLambdaFunction("axios-request", functionFilePath);
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

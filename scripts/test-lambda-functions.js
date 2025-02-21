const dotenv = require("dotenv");

const path = require("path");
const LambdaAdapter = require("../models/api-adapters/LambdaAdapter");

dotenv.config({ path: "./config.env" });

(async () => {
  try {
    const functionFilePath = path.resolve(__dirname, "lambdaCode.js");
    await LambdaAdapter.updateLambdaFunction("lambda-update-test", functionFilePath);
  } catch (error) {
    console.error(error);
  }

  try {
    const invokePayload = { key1: "value1", key2: "value2" };
    const invokeResponse = await LambdaAdapter.invokeLambdaFunction(
      "lambda-update-test",
      invokePayload
    );
    console.log(invokeResponse);
  } catch (error) {
    console.error(error);
  }

  process.exit();
})();

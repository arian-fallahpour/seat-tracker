const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const path = require("path");
const LambdaAdapter = require("../utils/services/LambdaAdapter");
const lambdaData = require("../data/lambda-data");

(async () => {
  async function createFunction(functionName) {
    try {
      const filePath = path.resolve(__dirname, "../aws/lambdas/axios-request/index.js");
      await LambdaAdapter.create(functionName, filePath, {
        layers: [LambdaAdapter.axiosLayerName],
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  const functionNames = lambdaData.functions.dynamic.axiosRequest;
  const promises = functionNames.map((functionName) => createFunction(functionName));

  await Promise.all(promises);
})();

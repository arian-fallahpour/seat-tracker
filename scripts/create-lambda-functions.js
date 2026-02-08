import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import path from "path";
import LambdaAdapter from "../utils/services/LambdaAdapter";
import lambdaData from "../data/lambda-data";

(async () => {
  async function createFunction(functionName) {
    try {
      const filePath = path.resolve(process.cwd(), "../aws/lambdas/axios-request/index.js");
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

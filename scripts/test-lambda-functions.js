const dotenv = require("dotenv");

const path = require("path");
const LambdaAdapter = require("../models/api-adapters/LambdaAdapter");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");

dotenv.config({ path: "./config.env" });

(async () => {
  // const cpusLength = require("os").cpus().length;

  try {
    const functionFilePath = path.resolve(
      __dirname,
      "../aws/lambdas/test-update-lambda/nodejs/index.js"
    );
    console.log(functionFilePath);
    await LambdaAdapter.updateLambdaFunction("test-update-lambda", functionFilePath);
  } catch (error) {
    console.error(error);
  }

  try {
    const invokePayload = {
      url: UoftAdapter.getCoursesURL,
      ...UoftAdapter.getFetchOptions({ search: "", page: 1 }),
    };
    const response = await LambdaAdapter.invokeLambdaFunction("test-update-lambda", invokePayload);
    console.log(response);
  } catch (error) {
    console.error(error);
  }

  process.exit();
})();

const path = require("path");
const {
  LambdaClient,
  InvokeCommand,
  UpdateFunctionCodeCommand,
} = require("@aws-sdk/client-lambda");
const { fromEnv } = require("@aws-sdk/credential-providers");
const Logger = require("../Logger");
const { sleep } = require("../helper-client");
const { fileToZipBuffer } = require("../helper-server");

const client = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

class LambdaAdapter {
  static axiosRequestName = "axios-request";

  static async invokeParallelAxiosRequests() {}

  /**
   * Invokes the axios-request lambda function
   */
  static async invokeAxiosRequest(payload) {
    return await this.invokeLambdaFunction(this.axiosRequestName, payload);
  }

  /**
   * Updates the axios-request lambda function to rotate its IP address
   */
  static async rotateAxiosRequest() {
    Logger.info("Updating lambda function code to rotate ip (wait 5 seconds)");

    const filePath = `../../aws/lambdas/${this.axiosRequestName}/index.js`;
    const functionFilePath = path.resolve(__dirname, filePath);

    await this.updateLambdaFunction(this.axiosRequestName, functionFilePath);
    await sleep(5000);
  }

  /**
   * Updates the lambda function with the name specified in functionName
   */
  static async updateLambdaFunction(functionName, filePath) {
    const functionZip = await fileToZipBuffer(filePath);

    const updateCommand = new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile: functionZip,
    });

    await client.send(updateCommand);
  }

  /**
   * Invokes the lambda function with the name specified in functionName
   */
  static async invokeLambdaFunction(functionName, payload) {
    const invokeCommand = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    const response = await client.send(invokeCommand);

    return this.parseResponse(response);
  }

  static parseResponse(response) {
    const json = new TextDecoder("utf-8").decode(response.Payload);
    const parsed = JSON.parse(json);
    if (!!parsed.errorType) {
      return new Error(parsed.errorMessage);
    }

    const data = JSON.parse(parsed.body);
    return data;
  }
}

module.exports = LambdaAdapter;

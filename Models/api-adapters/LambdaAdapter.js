const { fileToZipBuffer } = require("../../utils/helper-server");
const {
  LambdaClient,
  InvokeCommand,
  UpdateFunctionCodeCommand,
} = require("@aws-sdk/client-lambda");
const { fromEnv } = require("@aws-sdk/credential-providers");

const client = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

class LambdaAdapter {
  static async updateLambdaFunction(functionName, filePath) {
    const functionZip = await fileToZipBuffer(filePath);

    const updateCommand = new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile: functionZip,
    });

    await client.send(updateCommand);
  }

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

  static async updateAndInvokeFunction(functionName, functionPath, payload) {
    await updateLambdaFunction(functionName, functionPath);
    return await invokeLambdaFunction();
  }
}

module.exports = LambdaAdapter;

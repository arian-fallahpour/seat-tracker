const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { fromEnv } = require("@aws-sdk/credential-providers");
const {
  LambdaClient,
  InvokeCommand,
  UpdateFunctionCodeCommand,
  CreateFunctionCommand,
} = require("@aws-sdk/client-lambda");

const Logger = require("../Logger");
const { sleep } = require("../helper-client");

const client = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

class LambdaAdapter {
  static axiosRequestName = "axios-request";
  static webScrapeRequestName = "web-scrape-request";

  static axiosLayerName = "arn:aws:lambda:us-east-1:307800276274:layer:axios:1";
  static webScrapLayerName = "arn:aws:lambda:us-east-1:307800276274:layer:web-scrape:1";

  /**
   * Updates the axios-request lambda function to rotate its IP address
   */
  static async rotate(functionName, fileName) {
    const filePath = path.resolve(__dirname, `../../aws/lambdas/${fileName}/index.js`);
    await this.update(functionName, filePath);

    Logger.info(`Rotating ${functionName} (wait 5 seconds)`);
    await sleep(5000);
  }

  /**
   * Creates a lambda function with the name and file path specified
   */
  static async create(functionName, filePath, options = {}) {
    const ZipFile = await this.#fileToZipBuffer(filePath);
    const createCommand = new CreateFunctionCommand({
      FunctionName: functionName,
      Code: { ZipFile },
      Role: process.env.AWS_LAMBDA_ROLE_ARN,
      Runtime: "nodejs22.x",
      Handler: "index.handler",
      Layers: options.layers || [],
    });

    await client.send(createCommand);
  }

  /**
   * Updates the lambda function with the name specified in functionName
   */
  static async update(functionName, filePath) {
    const ZipFile = await this.#fileToZipBuffer(filePath);
    const updateCommand = new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile,
    });

    await client.send(updateCommand);
  }

  /**
   * Invokes the lambda function with the name specified in functionName
   */
  static async invoke(functionName, payload) {
    const invokeCommand = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    const response = await client.send(invokeCommand);

    return this.#parseResponse(response);
  }

  static #parseResponse(response) {
    const json = new TextDecoder("utf-8").decode(response.Payload);
    const parsed = JSON.parse(json);
    if (!!parsed.errorType) {
      return new Error(parsed.errorMessage);
    }

    const data = JSON.parse(parsed.body);
    return data;
  }

  static #fileToZipBuffer(filePath) {
    return new Promise((resolve, reject) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks = [];

      archive.on("data", (chunk) => chunks.push(chunk));
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);

      archive.append(fs.createReadStream(filePath), { name: require("path").basename(filePath) });
      archive.finalize();
    });
  }
}

module.exports = LambdaAdapter;

import dotenv from "dotenv";
dotenv.config();

import { fromEnv } from "@aws-sdk/credential-providers";
import {
  InvokeCommand,
  LambdaClient,
  ListFunctionsCommand,
  UpdateFunctionCodeCommand,
  CreateFunctionCommand,
} from "@aws-sdk/client-lambda";

import fs from "fs";
import path from "path";
import archiver from "archiver";

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

class LambdaAdapter {
  static async listFunctions(): Promise<string[]> {
    const command = new ListFunctionsCommand({});
    const response = await lambdaClient.send(command);

    if (!response.Functions) {
      return [];
    }

    return response.Functions.filter((fn) => fn.FunctionName)
      .filter((fn) => fn.FunctionName.startsWith("uni-tracker-"))
      .map((fn) => fn.FunctionName);
  }

  static async invoke(lambdaName: string, event: any): Promise<any> {
    const invokeCommand = new InvokeCommand({
      FunctionName: this.getLambdaName(lambdaName),
      Payload: JSON.stringify(event),
    });

    const response = await lambdaClient.send(invokeCommand);
    const decoded = new TextDecoder("utf-8").decode(response.Payload);
    return JSON.parse(decoded);
  }

  static async update(lambdaName: string, handlerName: string) {
    const filePath = path.join(process.cwd(), "aws", "lambda", handlerName, "index.mjs");
    const ZipFile: Buffer = await getCodeZipped(filePath);

    const updateFunctionCodeCommand = new UpdateFunctionCodeCommand({
      FunctionName: this.getLambdaName(lambdaName),
      ZipFile,
    });
    await lambdaClient.send(updateFunctionCodeCommand);
  }

  static async create(lambdaName: string, handlerName: string) {
    const filePath = path.join(process.cwd(), "aws", "lambda", handlerName, "index.mjs");
    const ZipFile: Buffer = await getCodeZipped(filePath);

    const createFunctionCommand = new CreateFunctionCommand({
      FunctionName: this.getLambdaName(lambdaName),
      Code: { ZipFile },
      Handler: "index.handler",
      Role: process.env.AWS_LAMBDA_ROLE_ARN,
      Runtime: "nodejs22.x",
      Environment: { Variables: { NODE_ENV: "production" } },
    });
    await lambdaClient.send(createFunctionCommand);
  }

  static getLambdaName(lambdaName: string): string {
    return `uni-tracker-${process.env.NODE_ENV}-${lambdaName}`;
  }
}

export default LambdaAdapter;

function getCodeZipped(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream("/tmp/lambda.zip");
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      const data = fs.readFileSync("/tmp/lambda.zip");
      resolve(data);
    });
    archive.on("error", (err: any) => {
      reject(err);
    });

    archive.pipe(output);
    archive.file(filePath, { name: "index.mjs" });
    archive.finalize();
  });
}

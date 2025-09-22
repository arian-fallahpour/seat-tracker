const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const LambdaAdapter = require("../utils/services/LambdaAdapter");
const UoftAdapter = require("../utils/Uoft/UoftAdapter");

dotenv.config({ path: "./.env" });

const functionName = LambdaAdapter.webScrapeRequestName;
const layerName = LambdaAdapter.webScrapLayerName;

(async () => {
  // Update function
  // try {
  //   const functionFilePath = path.resolve(__dirname, `../aws/lambdas/${functionName}/index.js`);
  //   await LambdaAdapter.create(functionName, functionFilePath, { layers: [layerName] });
  // } catch (error) {
  //   console.error(error);
  // }

  // Invoke function
  try {
    const payload = {
      // options: UoftAdapter.getFetchOptions({}),
      url: "https://jobs.careers.microsoft.com/global/en/search?q=software%20engineer&lc=United%20States&exp=Students%20and%20graduates&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true",
      options: {},
    };
    const response = await LambdaAdapter.invoke(functionName, payload);
    console.log(response);

    // Write response data to html file in current directory
    const outputFilePath = path.resolve(__dirname, `./output-${functionName}.html`);

    // Check the structure of the response and log it for debugging
    console.log("Lambda response:", response);

    // Try to write the correct property to file
    const htmlContent = response.data || response.body || response; // fallback if data is missing
    fs.writeFileSync(outputFilePath, htmlContent);
  } catch (error) {
    console.error(error);
  }

  process.exit();
})();

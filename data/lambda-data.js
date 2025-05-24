const { maxConcurrentLambdas } = require("./alerts-data");

const lambdaData = {
  functions: {
    static: {
      axiosRequest: "axios-request",
      lambdaTest: "lambda-test",
      testUpdateLambda: "test-update-lambda",
    },
    dynamic: {
      axiosRequest: new Array(maxConcurrentLambdas)
        .fill("axios-request")
        .map((n, i) => `${n}-${i + 1}`),
    },
  },
  layers: {
    static: {
      axios: "axios",
      webScraping: "web-scraping",
    },
    dynamic: {},
  },
};

module.exports = lambdaData;

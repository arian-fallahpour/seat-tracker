import alertsData from "./alerts-data";

const lambdaData = {
  functions: {
    static: {
      axiosRequest: "axios-request",
      lambdaTest: "lambda-test",
      testUpdateLambda: "test-update-lambda",
    },
    dynamic: {
      axiosRequest: new Array(alertsData.maxLambdas)
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
export default lambdaData;

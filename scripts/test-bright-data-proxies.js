import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import request from "request-promise";

(async () => {
  const proxyHost = "brd.superproxy.io";
  const proxyPort = 33335;
  const username = "brd-customer-hl_a4b1b21b-zone-america_canada";
  const password = "bifpgo8ks6n2";

  const proxyUrl = `http://${username}:${password}@${proxyHost}:${proxyPort}`;
  console.log(proxyUrl);

  const axiosInstance = axios.create({
    //   proxy: false, // Disable default proxy behavior
    httpAgent: new HttpsProxyAgent(proxyUrl),
    httpsAgent: new HttpsProxyAgent(proxyUrl),
  });

  axiosInstance
    .get("https://checkip.amazonaws.com/")
    .then((response) => {
      console.log("AA", response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  /*This sample code assumes the request-promise package is installed. If it is not installed run: "npm install request-promise"*/
  //   const username = "brd-customer-hl_a4b1b21b-zone-america_canada";
  //   const password = "bifpgo8ks6n2";
  //   const port = 33335;
  //   const session_id = (1000000 * Math.random()) | 0;
  //   const super_proxy =
  //     "http://" + username + "-session-" + session_id + ":" + password + "@brd.superproxy.io:" + port;
  //   const options = {
  //     url: "https://checkip.amazonaws.com/",
  //     proxy: super_proxy,
  //   };
  //   request(options).then(
  //     function (data) {
  //       console.log(data);
  //     },
  //     function (err) {
  //       console.error(err);
  //     }
  //   );
})();

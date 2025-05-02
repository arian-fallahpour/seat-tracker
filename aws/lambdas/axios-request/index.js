const axios = require("axios");

exports.handler = async (event) => {
  let ipAddress;
  try {
    const addressResponse = await fetch("https://checkip.amazonaws.com/");
    ipAddress = (await addressResponse.text()).trim();
  } catch (error) {}

  try {
    const { data } = await axios(event.options);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "success",
        ip: ipAddress,
        data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};

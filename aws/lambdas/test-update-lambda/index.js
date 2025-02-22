const slugify = require("slugify");

exports.handler = async (event) => {
  const addressResponse = await fetch("https://checkip.amazonaws.com/");
  const address = (await addressResponse.text()).trim();

  const text = "test test lol hey";

  const response = await fetch(event.url, event);

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: JSON.stringify({
        message: "Error in executing fetch request.",
      }),
    };
  }

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Running from: ${address}`,
      slug: slugify(text),
      data,
    }),
  };
};

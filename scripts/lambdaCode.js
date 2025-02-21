exports.handler = async (event) => {
  const response = await fetch("https://checkip.amazonaws.com/");
  const address = (await response.text()).trim();

  // TODO implement
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Running from: ${address}` }),
  };
};

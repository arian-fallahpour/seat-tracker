export const handler = async (event) => {
  const response = await fetch(event.url, {
    method: event.method,
    headers: event.headers,
    body: event.body,
  });

  const body = await response.json();

  if (!response.ok) {
    return {
      status: "error",
      message: body.message || `Error invoking lambda with status code ${response.status}`,
    };
  }

  return {
    status: response.ok ? "success" : "error",
    data: body,
  };
};

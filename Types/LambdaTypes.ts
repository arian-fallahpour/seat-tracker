export type LambdaResponseType = {
  status: "success" | "error";
  message?: string;
  data?: any;
};

export type LambdaRequestEventType = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: { [key: string]: string };
  body?: string;
};

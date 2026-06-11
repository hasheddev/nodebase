import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";

import ky, { type Options as KyOptions } from "ky";
type HttpRequestData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const { endpoint, method } = data;
  if (!endpoint) {
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }
  if (!method) {
    throw new NonRetriableError("HTTP Request node: No method configured");
  }

  const result = await step.run("http-request", async () => {
    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (data.body) {
        options.body = data.body;
      }
    }
    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();
    return {
      ...context,
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
  });
  return result;
};

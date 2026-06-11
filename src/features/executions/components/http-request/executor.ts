import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";

type HttpRequestData = {
  variableName?: string;
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
  const { endpoint, method, variableName } = data;
  if (!endpoint || typeof endpoint !== "string") {
    throw new NonRetriableError(
      `HTTP Request node(${nodeId}): endpoint not configured`,
    );
  }
  if (!method || typeof method !== "string") {
    throw new NonRetriableError(
      `HTTP Request node(${nodeId}): Http method not configured`,
    );
  }
  if (!variableName || typeof variableName !== "string") {
    throw new NonRetriableError(
      `HTTP Request node(${nodeId}): variable name not configured`,
    );
  }

  const result = await step.run("http-request", async () => {
    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (data.body) {
        options.body = data.body;
        options.headers = {
          "Content-Type": "application/json",
        };
      }
    }
    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    return {
      ...context,
      [variableName]: responsePayload,
    };
  });
  return result;
};

import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels/http-request";

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

//to use send {{json todo.httpResponse.data}} where data is an object and todo is the varaible name.
//json can be any name but the helper must match that name in registerHelper(name, () => {})
//registerHelper(wayson, () => {}) works with {{wayson todo.httpResponse.data}}
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const { endpoint, method, variableName } = data;

  if (!endpoint || typeof endpoint !== "string") {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `HTTP Request node(${nodeId}): endpoint not configured`,
    );
  }
  if (!method || typeof method !== "string") {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `HTTP Request node(${nodeId}): Http method not configured`,
    );
  }
  if (!variableName || typeof variableName !== "string") {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `HTTP Request node(${nodeId}): variable name not configured`,
    );
  }

  try {
    const result = await step.run("http-request", async () => {
      const options: KyOptions = { method };
      //use try catch and check type is string for more safety
      const urlEndpoint = Handlebars.compile(endpoint)(context);

      if (["POST", "PUT", "PATCH"].includes(method)) {
        if (data.body) {
          const resolved = Handlebars.compile(data.body || "{}")(context);
          JSON.parse(resolved);
          options.body = resolved;
          options.headers = {
            "Content-Type": "application/json",
          };
        }
      }
      const response = await ky(urlEndpoint, options);
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
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

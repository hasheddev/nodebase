import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { geminiTriggerChannel } from "@/inngest/channels/gemini-channel";

type GeminiRequestData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

//to use send {{json todo.httpResponse.data}} where data is an object and todo is the varaible name.
//json can be any name but the helper must match that name in registerHelper(name, () => {})
//registerHelper(wayson, () => {}) works with {{wayson todo.httpResponse.data}}
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

export const geminiRequestExecutor: NodeExecutor<GeminiRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    geminiTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const { userPrompt: input, variableName, systemPrompt: prompt } = data;

  if (!input || typeof input !== "string") {
    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Gemini node(${nodeId}): userPrompt not configured`,
    );
  }
  if (!variableName || typeof variableName !== "string") {
    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Gemini node(${nodeId}): variable name not configured`,
    );
  }

  const systemPrompt = prompt
    ? Handlebars.compile(prompt)(context)
    : "You are a helpful assistant";
  const userPrompt = Handlebars.compile(input)(context);
  const credential = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  const google = createGoogleGenerativeAI({
    apiKey: credential,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const firstContentBlock = steps?.[0]?.content?.[0];
    const textOutput =
      firstContentBlock && firstContentBlock.type === "text"
        ? firstContentBlock.text
        : "";

    const usage = steps?.[0]?.usage || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
    };
    const finishReason = steps?.[0]?.finishReason || "unknown";
    const responseBody = steps?.[0]?.response?.body as Record<string, unknown>;
    const actualModelUsed = responseBody?.modelVersion || "gemini-2.5-flash";

    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return {
      ...context,
      [variableName]: {
        aiResponse: textOutput,
        finishReason: finishReason,
        modelUsed: actualModelUsed,
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          reasoningTokens: usage.reasoningTokens || 0,
          totalTokens: usage.totalTokens,
        },
      },
    };
  } catch (error) {
    await publish(
      geminiTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

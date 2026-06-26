import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { anthropicTriggerChannel } from "@/inngest/channels/anthropic-channel";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type AnthropicRequestData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

//to use send {{json todo.httpResponse.data}} where data is an object and todo is the varaible name.
//json can be any name but the helper must match that name in registerHelper(name, () => {})
//registerHelper(wayson, () => {}) works with {{wayson todo.httpResponse.data}}
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

export const anthropicRequestExecutor: NodeExecutor<
  AnthropicRequestData
> = async ({ data, nodeId, context, step, publish, userId }) => {
  await publish(
    anthropicTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const {
    credentialId,
    userPrompt: input,
    variableName,
    systemPrompt: prompt,
  } = data;

  if (!input || typeof input !== "string") {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Anthropic node(${nodeId}): userPrompt not configured`,
    );
  }
  if (!credentialId || typeof credentialId !== "string") {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Anthropic node(${nodeId}): credential not configured`,
    );
  }
  if (!variableName || typeof variableName !== "string") {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Anthropic node(${nodeId}): variable name not configured`,
    );
  }

  const credential = await step.run("get-credential", async () => {
    return prisma.credential.findUnique({
      where: {
        id: credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Anthropic node(${nodeId}): credential not found`,
    );
  }

  const systemPrompt = prompt
    ? Handlebars.compile(prompt)(context)
    : "You are a helpful assistant";
  const userPrompt = Handlebars.compile(input)(context);
  const anthropic = createAnthropic({
    apiKey: decrypt(credential.value),
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-4-0"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

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
    const actualModelUsed = responseBody?.modelVersion || "claude-sonnet-4-0";

    await publish(
      anthropicTriggerChannel().status({
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
      anthropicTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

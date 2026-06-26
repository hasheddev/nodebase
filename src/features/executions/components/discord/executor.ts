import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { discordTriggerChannel } from "@/inngest/channels/discord-channel";

type DiscordRequestData = {
  variableName: string;
  content: string;
  webhookUrl: string;
  username?: string | undefined;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

export const discordRequestExecutor: NodeExecutor<DiscordRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const { webhookUrl, variableName, content: text } = data;

  if (!text || typeof text !== "string") {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `discord node(${nodeId}): message content not given`,
    );
  }

  if (!webhookUrl || typeof webhookUrl !== "string") {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `discord node(${nodeId}): webhook URL not configured`,
    );
  }
  if (!variableName || typeof variableName !== "string") {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `discord node(${nodeId}): variable name not configured`,
    );
  }

  const rawContent = Handlebars.compile(text)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const urlEndpoint = Handlebars.compile(webhookUrl)(context);
    const result = await step.run("discord-webhook", async () => {
      await ky.post(urlEndpoint, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });
      return {
        ...context,
        [variableName]: {
          discordMessageSent: true,
        },
      };
    });

    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      discordTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

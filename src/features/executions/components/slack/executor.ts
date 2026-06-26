import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import type { NodeExecutor } from "@/features/executions/types";
import { slackTriggerChannel } from "@/inngest/channels/slack-channel";

type SlackRequestData = {
  variableName?: string;
  content?: string;
  webhookUrl?: string;
};

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

export const slackRequestExecutor: NodeExecutor<SlackRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    slackTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const { webhookUrl, variableName, content: text } = data;

  if (!text || typeof text !== "string") {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `slack node(${nodeId}): message content not given`,
    );
  }

  if (!webhookUrl || typeof webhookUrl !== "string") {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `slack node(${nodeId}): webhook URL not configured`,
    );
  }
  if (!variableName || typeof variableName !== "string") {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `slack node(${nodeId}): variable name not configured`,
    );
  }

  const rawContent = Handlebars.compile(text)(context);
  const content = decode(rawContent);

  try {
    const urlEndpoint = Handlebars.compile(webhookUrl)(context);
    const result = await step.run("slack-webhook", async () => {
      await ky.post(urlEndpoint, {
        json: {
          content: content, //key depend on workflow config
        },
      });
      return {
        ...context,
        [variableName]: {
          slackMessageSent: true,
        },
      };
    });

    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      slackTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

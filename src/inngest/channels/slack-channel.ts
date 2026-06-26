import { channel, topic } from "@inngest/realtime";

export type HttpRequestExecStatusType = {
  nodeId: string;
  status: "loading" | "success" | "error";
};

export const SLACK_CHANNEL_NAME = "slack-execution";

export const slackTriggerChannel = channel(SLACK_CHANNEL_NAME).addTopic(
  topic("status").type<HttpRequestExecStatusType>(),
);

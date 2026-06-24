import { channel, topic } from "@inngest/realtime";

export type HttpRequestExecStatusType = {
  nodeId: string;
  status: "loading" | "success" | "error";
};

export const ANTHROPIC_CHANNEL_NAME = "anthropic-trigger-execution";

export const anthropicTriggerChannel = channel(ANTHROPIC_CHANNEL_NAME).addTopic(
  topic("status").type<HttpRequestExecStatusType>(),
);

import { channel, topic } from "@inngest/realtime";

export type HttpRequestExecStatusType = {
  nodeId: string;
  status: "loading" | "success" | "error";
};

export const OPENAI_CHANNEL_NAME = "openai-trigger-execution";

export const openaiTriggerChannel = channel(OPENAI_CHANNEL_NAME).addTopic(
  topic("status").type<HttpRequestExecStatusType>(),
);

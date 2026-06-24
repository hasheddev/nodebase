import { channel, topic } from "@inngest/realtime";

export type HttpRequestExecStatusType = {
  nodeId: string;
  status: "loading" | "success" | "error";
};

export const GEMINI_CHANNEL_NAME = "gemini-trigger-execution";

export const geminiTriggerChannel = channel(GEMINI_CHANNEL_NAME).addTopic(
  topic("status").type<HttpRequestExecStatusType>(),
);

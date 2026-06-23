import { channel, topic } from "@inngest/realtime";

export type HttpRequestExecStatusType = {
  nodeId: string;
  status: "loading" | "success" | "error";
};

export const MANUAL_TRIGGER_CHANNEL_NAME = "manaul-trigger-execution";

export const manualTriggerChannel = channel(
  MANUAL_TRIGGER_CHANNEL_NAME,
).addTopic(topic("status").type<HttpRequestExecStatusType>());

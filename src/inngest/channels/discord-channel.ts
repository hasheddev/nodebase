import { channel, topic } from "@inngest/realtime";

export type HttpRequestExecStatusType = {
  nodeId: string;
  status: "loading" | "success" | "error";
};

export const DISCORD_CHANNEL_NAME = "discord-execution";

export const discordTriggerChannel = channel(DISCORD_CHANNEL_NAME).addTopic(
  topic("status").type<HttpRequestExecStatusType>(),
);

"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { discordTriggerChannel } from "@/inngest/channels/discord-channel";
import { inngest } from "@/inngest/client";

export type DiscordRequestToken = Realtime.Token<
  typeof discordTriggerChannel,
  ["status"]
>;

export async function fetchDiscordRequestRealtimeToken(): Promise<DiscordRequestToken> {
  return await getSubscriptionToken(inngest, {
    channel: discordTriggerChannel(),
    topics: ["status"],
  });
}

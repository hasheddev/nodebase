"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { anthropicTriggerChannel } from "@/inngest/channels/anthropic-channel";
import { inngest } from "@/inngest/client";

export type AnthropicRequestToken = Realtime.Token<
  typeof anthropicTriggerChannel,
  ["status"]
>;

export async function fetchAnthropicRequestRealtimeToken(): Promise<AnthropicRequestToken> {
  return await getSubscriptionToken(inngest, {
    channel: anthropicTriggerChannel(),
    topics: ["status"],
  });
}

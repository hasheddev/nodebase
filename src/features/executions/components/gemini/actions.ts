"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { geminiTriggerChannel } from "@/inngest/channels/gemini-channel";
import { inngest } from "@/inngest/client";

export type GeminiRequestToken = Realtime.Token<
  typeof geminiTriggerChannel,
  ["status"]
>;

export async function fetchGeminiRequestRealtimeToken(): Promise<GeminiRequestToken> {
  return await getSubscriptionToken(inngest, {
    channel: geminiTriggerChannel(),
    topics: ["status"],
  });
}

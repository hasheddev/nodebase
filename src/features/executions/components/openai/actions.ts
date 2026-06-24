"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { openaiTriggerChannel } from "@/inngest/channels/openai-channel";
import { inngest } from "@/inngest/client";

export type OpenAiRequestToken = Realtime.Token<
  typeof openaiTriggerChannel,
  ["status"]
>;

export async function fetchOpenAiRequestRealtimeToken(): Promise<OpenAiRequestToken> {
  return await getSubscriptionToken(inngest, {
    channel: openaiTriggerChannel(),
    topics: ["status"],
  });
}

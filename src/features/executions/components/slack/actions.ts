"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { slackTriggerChannel } from "@/inngest/channels/slack-channel";
import { inngest } from "@/inngest/client";

export type SlackRequestToken = Realtime.Token<
  typeof slackTriggerChannel,
  ["status"]
>;

export async function fetchSlackRequestRealtimeToken(): Promise<SlackRequestToken> {
  return await getSubscriptionToken(inngest, {
    channel: slackTriggerChannel(),
    topics: ["status"],
  });
}

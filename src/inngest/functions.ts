import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/executions/lib/executor-registery";
import prisma from "@/lib/db";
import { anthropicTriggerChannel } from "./channels/anthropic-channel";
import { discordTriggerChannel } from "./channels/discord-channel";
import { geminiTriggerChannel } from "./channels/gemini-channel";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openaiTriggerChannel } from "./channels/openai-channel";
import { slackTriggerChannel } from "./channels/slack-channel";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute-workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiTriggerChannel(),
      openaiTriggerChannel(),
      anthropicTriggerChannel(),
      discordTriggerChannel(),
      slackTriggerChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const worfklowId = event.data.workflowId;
    if (!worfklowId) {
      throw new NonRetriableError("Workflow Id is Missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const { nodes, connections } = await prisma.workflow.findUniqueOrThrow({
        where: { id: worfklowId },
        include: { nodes: true, connections: true },
      });
      return topologicalSort(nodes, connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: worfklowId },
        select: {
          userId: true,
        },
      });
      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }
      return workflow.userId;
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
        userId,
      });
    }
    return { sortedNodes };
  },
);

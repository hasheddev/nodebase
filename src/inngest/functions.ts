import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/executions/lib/executor-registery";
import { ExecutionStatus } from "@/generated/prisma";
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
  {
    id: "execute-workflow",
    onFailure: async ({ event }) => {
      prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          error: event.data.error.message,
          errorStack: event.data.error.stack,
          status: ExecutionStatus.FAILED,
        },
      });
    },
  },
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
    const inngestEventId = event.id;

    const workflowId = event.data.workflowId;
    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("Workflow ID or Event ID is Missing");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const { nodes, connections } = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
      });
      return topologicalSort(nodes, connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
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
    await step.run("update-execution", () => {
      return prisma.execution.update({
        where: {
          inngestEventId,
          workflowId,
        },
        data: {
          completedAt: new Date(),
          status: ExecutionStatus.SUCCESS,
          output: context,
        },
      });
    });
    return { workflowId, result: context };
  },
);

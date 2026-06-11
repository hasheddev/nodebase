import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/executions/lib/executor-registery";
import prisma from "@/lib/db";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute-workflow" },
  async ({ event, step }) => {
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

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      });
    }
    return { sortedNodes };
  },
);

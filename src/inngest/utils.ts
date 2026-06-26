import { createId } from "@paralleldrive/cuid2";
import toposort from "toposort";
import type { Connection, Node } from "@/generated/prisma";
import { inngest } from "./client";

export function topologicalSort(
  nodes: Node[],
  connectons: Connection[],
): Node[] {
  if (connectons.length === 0) return nodes;

  const edges: [string, string][] = connectons.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  const connectedNodeids = new Set<string>();
  for (const conn of connectons) {
    connectedNodeids.add(conn.fromNodeId);
    connectedNodeids.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeids.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)).filter(Boolean) as Node[];
}

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: unknown;
}) => {
  return inngest.send({
    name: "workflows/execute-workflow",
    data,
    id: createId(),
  });
};

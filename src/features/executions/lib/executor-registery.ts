import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { NodeType } from "@/generated/prisma";
import { httpRequestExecutor } from "../components/http-request/executor";
import type { NodeExecutor } from "../types";

type InitialData = Record<string, unknown>;

export const initialExecutor: NodeExecutor<InitialData> = async ({
  context,
  step,
}) => {
  const result = await step.run("initial-executor", async () => context);
  return result;
};

export const executorRegistery: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INITIAL]: initialExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const excutor = executorRegistery[type];
  if (!excutor) {
    throw new Error(`No excutor found for node type: ${type}`);
  }
  return excutor;
};

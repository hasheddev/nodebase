import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { NodeType } from "@/generated/prisma";
import { anthropicRequestExecutor } from "../components/anthropic/executor";
import { geminiRequestExecutor } from "../components/gemini/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { openAiRequestExecutor } from "../components/openai/executor";
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
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiRequestExecutor,
  [NodeType.ANTHROPIC]: anthropicRequestExecutor,
  [NodeType.OPENAI]: openAiRequestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const excutor = executorRegistery[type];
  if (!excutor) {
    throw new Error(`No excutor found for node type: ${type}`);
  }
  return excutor;
};

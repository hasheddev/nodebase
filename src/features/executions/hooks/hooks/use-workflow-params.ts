import { useQueryStates } from "nuqs";
import { workflowParams } from "../params";

export const useWorkflowsParams = () => useQueryStates(workflowParams);

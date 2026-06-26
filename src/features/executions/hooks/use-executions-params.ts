import { useQueryStates } from "nuqs";
import { executionParams } from "../params";

export const useExecutionsParams = () => useQueryStates(executionParams);

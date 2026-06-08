import { trpc, prefetch } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

export type Input = inferInput<typeof trpc.workflows.getMany>;

export const prefetchWorkflows = async (params: Input) => {
  return prefetch(trpc.workflows.getMany.queryOptions(params));
};

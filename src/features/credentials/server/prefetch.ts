import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

export type Input = inferInput<typeof trpc.credentials.getMany>;

export const prefetchCredentials = async (params: Input) => {
  return prefetch(trpc.credentials.getMany.queryOptions(params));
};

export const prefetchCredential = async (id: string) => {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
};

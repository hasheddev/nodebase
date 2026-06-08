import {
  mockMutationOptionsInterceptor,
  mockQueryOptionsInterceptor,
  mockTrpcQuery,
} from "./tanstack.mock";

export const mockUseTRPC = jest.fn(() => ({
  workflows: {
    create: {
      mutationOptions: (options: any) =>
        mockMutationOptionsInterceptor(options),
    },
    getMany: {
      queryOptions: (input: any) =>
        mockQueryOptionsInterceptor(input, "getMany"),
      useQuery: (input: any) => {
        try {
          const data = mockTrpcQuery(input);
          return { data, error: null, isLoading: false, isSuccess: true };
        } catch (error) {
          return { data: undefined, error, isLoading: false, isSuccess: false };
        }
      },
    },
  },
}));

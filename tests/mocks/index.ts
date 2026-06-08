export * from "./authClient.mock";
export * from "./image.mock";
export * from "./link.mock";
export * from "./router.mock";
export * from "./toast.mock";
export * from "./tanstack.mock";
export * from "./trpc.mock";

export const resetAllMocks = () => {
  jest.clearAllMocks();
};

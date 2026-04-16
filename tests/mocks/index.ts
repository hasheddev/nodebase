export * from "./authClient.mock";
export * from "./image.mock";
export * from "./link.mock";
export * from "./router.mock";
export * from "./toast.mock";

export const resetAllMocks = () => {
  jest.clearAllMocks();
};

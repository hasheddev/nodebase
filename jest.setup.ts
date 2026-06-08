import "@testing-library/jest-dom";

import {
  mockToast,
  mockUseRouter,
  mockUseToast,
  MockLink,
  mockAuthClient,
  MockImage,
  mockUsePathname,
  mockUseSearchParams,
  mockUseTRPC,
  mockUseMutation,
  mockUseQuery,
} from "./tests/mocks";

jest.mock("next/navigation", () => ({
  useRouter: mockUseRouter,
  usePathname: mockUsePathname,
  useSearchParams: mockUseSearchParams,
}));
jest.mock("sonner", () => ({ useToast: mockUseToast, toast: mockToast }));
jest.mock("next/link", () => MockLink);
jest.mock("@/lib/auth-client", () => ({
  authClient: mockAuthClient,
}));
jest.mock("next/image", () => MockImage);

jest.mock("@/trpc/client", () => {
  const actual = jest.requireActual("@/trpc/client");
  return {
    ...actual,
    useTRPC: mockUseTRPC,
  };
});

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
  };
});

// jest.setup.ts

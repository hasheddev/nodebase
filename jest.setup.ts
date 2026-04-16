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

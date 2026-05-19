import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  mockAuthClient,
  mockRouter,
  mockUsePathname,
  resetAllMocks,
} from "../../mocks";

const user = userEvent.setup();

const defineMatcMedia = () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false, // Default to desktop view for tests
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated but still used by some hooks
      removeListener: jest.fn(), // Deprecated but still used by some hooks
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

const renderSidebar = () => {
  return render(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
};

describe("AppSidebar Component", () => {
  beforeEach(() => {
    resetAllMocks();
    defineMatcMedia();
  });

  describe("Rendering", () => {
    it("should render the logo and all main navigation links", () => {
      renderSidebar();

      expect(screen.getByAltText("nodebase icon")).toBeInTheDocument();
      expect(screen.getByText("Nodebase")).toBeInTheDocument();

      // Check main menu items
      expect(screen.getByRole("link", { name: /workflows/i })).toHaveAttribute(
        "href",
        "/workflows",
      );
      expect(
        screen.getByRole("link", { name: /credentials/i }),
      ).toHaveAttribute("href", "/credentials");
      expect(screen.getByRole("link", { name: /executions/i })).toHaveAttribute(
        "href",
        "/executions",
      );
    });

    it("should render footer action buttons", () => {
      renderSidebar();

      expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
      expect(screen.getByText(/billing portal/i)).toBeInTheDocument();
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });
  });

  describe("Navigation State", () => {
    it("should highlight the active menu item based on the pathname", () => {
      mockUsePathname.mockReturnValue("/workflows");

      renderSidebar();

      const workflowLink = screen.getByRole("link", { name: /workflows/i });
      // Shadcn SidebarMenuButton sets a data-active attribute when isActive is true
      expect(workflowLink).toHaveAttribute("data-active", "true");

      const executionsLink = screen.getByRole("link", { name: /executions/i });
      expect(executionsLink).not.toHaveAttribute("data-active", "true");

      const credentialsLink = screen.getByRole("link", {
        name: /credentials/i,
      });
      expect(credentialsLink).not.toHaveAttribute("data-active", "true");
    });
  });

  describe("Sign Out Logic", () => {
    it("should call authClient.signOut and redirect to login on success", async () => {
      renderSidebar();

      const signOutButton = screen.getByText(/sign out/i);
      await user.click(signOutButton);

      // Verify authClient was called with the correct structure
      expect(mockAuthClient.signOut).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchOptions: expect.objectContaining({
            onSuccess: expect.any(Function),
          }),
        }),
      );
      // Verify redirection
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });
});

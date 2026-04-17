// app/(auth)/auth-layout.test.tsx
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "@/features/auth/components/auth-layout";

describe("AuthLayout", () => {
  it("renders the logo with a link to home", () => {
    render(
      <AuthLayout>
        <div data-testid="child">Form Content</div>
      </AuthLayout>,
    );

    const logoLink = screen.getByRole("link", { name: /Nodebase/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renders the children passed to it", () => {
    render(
      <AuthLayout>
        <div data-testid="child">Form Content</div>
      </AuthLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

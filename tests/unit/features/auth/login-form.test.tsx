import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "@/features/auth/components/login-form";
import {
  mockAuthClient,
  mockRouter,
  mockSignInFail,
  mockToast,
  resetAllMocks,
} from "../../../mocks";

const user = userEvent.setup();

describe("LoginForm Component", () => {
  const getComponents = () => {
    const googleLoginButton = screen.getByRole("button", {
      name: /continue with google/i,
    });
    const gitHubLoginButton = screen.getByRole("button", {
      name: /continue with github/i,
    });
    const emailField = screen.getByLabelText("Email");
    const passWordField = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });
    const signUpLink = screen.getByRole("link", { name: "Sign up" });

    return {
      gitHubLoginButton,
      googleLoginButton,
      passWordField,
      emailField,
      loginButton,
      signUpLink,
    };
  };
  beforeEach(() => resetAllMocks());

  describe("Rendering", () => {
    it("should display all necessary fields", () => {
      render(<LoginForm />);

      const {
        gitHubLoginButton,
        googleLoginButton,
        passWordField,
        emailField,
        loginButton,
        signUpLink,
      } = getComponents();

      expect(gitHubLoginButton).toBeInTheDocument();
      expect(googleLoginButton).toBeInTheDocument();
      expect(passWordField).toBeInTheDocument();
      expect(emailField).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute("href", "/signup");
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should display all validation errors when there are invalid input values", async () => {
      render(<LoginForm />);

      const { passWordField, emailField } = getComponents();

      await user.type(passWordField, "inv");
      await user.type(emailField, "invalidEmail");

      expect(
        await screen.findByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
    });

    it("should display no validation errors when there is no invalid input value", async () => {
      render(<LoginForm />);

      const { passWordField, emailField } = getComponents();

      await user.type(passWordField, "inv");
      await user.type(emailField, "invalidEmail");

      expect(
        await screen.findByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();

      await user.clear(passWordField);
      await user.clear(emailField);
      await user.type(passWordField, "validPassword");
      await user.type(emailField, "validemail@gmail.com");
      expect(
        screen.queryByText(/please enter a valid email address/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("should call onSuccess for sucessful submission with toast.success and redirect", async () => {
      render(<LoginForm />);
      const { passWordField, emailField, loginButton } = getComponents();

      await user.type(passWordField, "validPassword");
      await user.type(emailField, "validemail@gmail.com");
      await user.click(loginButton);

      expect(loginButton).toHaveAttribute("disabled");
      expect(mockAuthClient.signIn.email).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "validemail@gmail.com",
          password: "validPassword",
          callbackURL: "/",
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/");
        expect(mockToast.success).toHaveBeenCalledWith("Welcome back!", {
          duration: 3000,
        });
      });
    });

    it("should call onError for failed submission with toast.error and no redirect", async () => {
      render(<LoginForm />);
      const { passWordField, emailField, loginButton } = getComponents();

      mockAuthClient.signIn.email.mockImplementation(mockSignInFail);
      await user.type(passWordField, "validPassword");
      await user.type(emailField, "validemail@gmail.com");
      await user.click(loginButton);

      expect(loginButton).toHaveAttribute("disabled");

      expect(mockAuthClient.signIn.email).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "validemail@gmail.com",
          password: "validPassword",
          callbackURL: "/",
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );

      await waitFor(() => {
        expect(mockRouter.replace).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith("sign in failed!", {
          duration: 3000,
        });
      });
    });
  });
});

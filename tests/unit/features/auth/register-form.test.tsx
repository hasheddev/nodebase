import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegisterForm } from "@/features/auth/components/register-form";
import {
  mockAuthClient,
  mockRouter,
  mockSignUpFail,
  mockToast,
  resetAllMocks,
} from "../../../mocks";

const user = userEvent.setup();

describe("RegisterForm Component", () => {
  const getComponents = () => {
    const googleLoginButton = screen.getByRole("button", {
      name: /continue with google/i,
    });
    const gitHubLoginButton = screen.getByRole("button", {
      name: /continue with github/i,
    });
    const nameField = screen.getByLabelText("Name");
    const emailField = screen.getByLabelText("Email");
    const passWordField = screen.getByLabelText("Password");
    const confirmPasswordField = screen.getByLabelText("Confirm Password");
    const registerButton = screen.getByRole("button", { name: "Register" });
    const loginLink = screen.getByRole("link", { name: "Login" });

    return {
      gitHubLoginButton,
      googleLoginButton,
      confirmPasswordField,
      nameField,
      passWordField,
      emailField,
      registerButton,
      loginLink,
    };
  };
  beforeEach(() => resetAllMocks());

  describe("Rendering", () => {
    it("should display all necessary fields", () => {
      render(<RegisterForm />);

      const {
        gitHubLoginButton,
        googleLoginButton,
        passWordField,
        emailField,
        registerButton,
        loginLink,
        nameField,
        confirmPasswordField,
      } = getComponents();

      expect(gitHubLoginButton).toBeInTheDocument();
      expect(googleLoginButton).toBeInTheDocument();
      expect(nameField).toBeInTheDocument();
      expect(confirmPasswordField).toBeInTheDocument();
      expect(passWordField).toBeInTheDocument();
      expect(emailField).toBeInTheDocument();
      expect(registerButton).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
      expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should display all validation errors when there are invalid input values", async () => {
      render(<RegisterForm />);

      const { passWordField, emailField, nameField, confirmPasswordField } =
        getComponents();

      await user.type(passWordField, "inv");
      await user.type(emailField, "invalidEmail");
      await user.type(nameField, "i");
      await user.type(confirmPasswordField, "invlidP");

      expect(
        await screen.findByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Name must be at least 2 characters/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Password don't match/i),
      ).toBeInTheDocument();
    });

    it("should display no validation errors when there is no invalid input value", async () => {
      render(<RegisterForm />);

      const { passWordField, emailField, nameField, confirmPasswordField } =
        getComponents();

      await user.type(passWordField, "inv");
      await user.type(emailField, "invalidEmail");
      await user.type(nameField, "i");
      await user.type(confirmPasswordField, "invlidP");

      expect(
        await screen.findByText(/please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/name must be at least 2 characters/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/password don't match/i),
      ).toBeInTheDocument();

      await user.clear(passWordField);
      await user.clear(emailField);
      await user.clear(nameField);
      await user.clear(confirmPasswordField);

      await user.type(passWordField, "validPassword");
      await user.type(emailField, "validemail@gmail.com");
      await user.type(nameField, "validName");
      await user.type(confirmPasswordField, "validPassword");
      expect(
        screen.queryByText(/please enter a valid email address/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password must be at least 6 characters/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/name must be at least 2 characters/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/password don't match/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("should call onSuccess for sucessful submission with toast.success and redirect", async () => {
      render(<RegisterForm />);

      const {
        passWordField,
        emailField,
        registerButton,
        nameField,
        confirmPasswordField,
      } = getComponents();

      await user.type(passWordField, "validPassword");
      await user.type(emailField, "validemail@gmail.com");
      await user.type(nameField, "validName");
      await user.type(confirmPasswordField, "validPassword");
      await user.click(registerButton);

      expect(registerButton).toHaveAttribute("disabled");
      expect(mockAuthClient.signUp.email).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "validemail@gmail.com",
          password: "validPassword",
          name: "validName",
          callbackURL: "/",
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/");
        expect(mockToast.success).toHaveBeenCalledWith("Welcome aboard!", {
          duration: 3000,
        });
      });
    });

    it("should call onError for failed submission with toast.error and no redirect", async () => {
      render(<RegisterForm />);
      const {
        passWordField,
        emailField,
        registerButton,
        nameField,
        confirmPasswordField,
      } = getComponents();

      mockAuthClient.signUp.email.mockImplementation(mockSignUpFail);

      await user.type(passWordField, "validPassword");
      await user.type(emailField, "validemail@gmail.com");
      await user.type(nameField, "validName");
      await user.type(confirmPasswordField, "validPassword");
      await user.click(registerButton);

      expect(registerButton).toHaveAttribute("disabled");

      expect(mockAuthClient.signUp.email).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "validemail@gmail.com",
          password: "validPassword",
          name: "validName",
          callbackURL: "/",
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );

      await waitFor(() => {
        expect(mockRouter.replace).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith("sign up failed!", {
          duration: 3000,
        });
      });
    });
  });
});

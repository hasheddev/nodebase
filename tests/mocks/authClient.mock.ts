const delay = () => new Promise((resolve) => setTimeout(resolve, 200));

export const mockSignIn = {
  email: jest.fn(async (data, options) => {
    await delay();
    options?.onSuccess?.();
    return { data: { user: { id: "1" } }, error: null };
  }),
};

const ctx = {
  error: { message: "sign in failed!" },
};

export const mockSignInFail = jest.fn(async (data, options) => {
  await delay();
  options?.onError?.(ctx);
  return { data: { user: { id: "1" } }, error: null };
});

export const mockSignUp = {
  email: jest.fn(async (data, options) => {
    await delay();
    options?.onSuccess?.({ data: { user: { id: "1" } } });

    return { data: { user: { id: "1" } }, error: null };
  }),
};

const signUpOptions = {
  error: { message: "sign up failed!" },
};

export const mockSignUpFail = jest.fn(async (data, options) => {
  await delay();
  options?.onError?.(signUpOptions);
  return { data: { user: { id: "1" } }, error: null };
});

export const mockSignOut = jest.fn(async (options) => {
  options?.fetchOptions?.onSuccess();
});

export const mockUseSesion = jest.fn(async () => ({
  data: null,
  isPending: false,
}));

export const mockAuthClient = {
  signIn: mockSignIn,
  signUp: mockSignUp,
  signOut: mockSignOut,
  useSession: mockUseSesion,
};

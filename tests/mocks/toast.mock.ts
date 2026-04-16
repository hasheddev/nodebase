export const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
};

export const mockUseToast = jest.fn(() => ({
  toast: mockToast,
  toasts: [],
  dismiss: jest.fn(),
}));

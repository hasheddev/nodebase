const mockRouter = {
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

const mockUsePathname = jest.fn(() => "/");
const mockUseSearchParams = jest.fn(() => new URLSearchParams());
const mockUseRouter = jest.fn(() => mockRouter);

export { mockRouter, mockUseRouter, mockUsePathname, mockUseSearchParams };

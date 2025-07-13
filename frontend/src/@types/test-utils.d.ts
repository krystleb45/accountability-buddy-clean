export type MockFunction<T extends (...args: unknown[]) => unknown> = jest.Mock<
  ReturnType<T>,
  Parameters<T>
>;

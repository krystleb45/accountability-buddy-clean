// msw.d.ts
declare module "msw" {
  import type { DefaultBodyType, MockedRequest, PathParams } from "msw"

  export const rest: {
    get: <RequestBodyType = DefaultBodyType>(
      url: string,
      resolver: (
        req: MockedRequest<RequestBodyType, PathParams<string>>,
        res: (responseResolver: unknown) => unknown,
        ctx: unknown,
      ) => unknown,
    ) => unknown
    post: <RequestBodyType = DefaultBodyType>(
      url: string,
      resolver: (
        req: MockedRequest<RequestBodyType, PathParams<string>>,
        res: (responseResolver: unknown) => unknown,
        ctx: unknown,
      ) => unknown,
    ) => unknown
    put: <RequestBodyType = DefaultBodyType>(
      url: string,
      resolver: (
        req: MockedRequest<RequestBodyType, PathParams<string>>,
        res: (responseResolver: unknown) => unknown,
        ctx: unknown,
      ) => unknown,
    ) => unknown
    delete: <RequestBodyType = DefaultBodyType>(
      url: string,
      resolver: (
        req: MockedRequest<RequestBodyType, PathParams<string>>,
        res: (responseResolver: unknown) => unknown,
        ctx: unknown,
      ) => unknown,
    ) => unknown
    // Add other HTTP methods as needed
  }
  type MockedRequest<
    RequestBodyType = DefaultBodyType,
    PathParamsType = PathParams<string>,
  > = Omit<Request, "body" | "params"> & {
    body: RequestBodyType
    params: PathParamsType
  }

  export const setupWorker: (
    ...handlers: Array<(...args: unknown[]) => unknown>
  ) => unknown

  export const setupServer: (
    ...handlers: Array<(...args: unknown[]) => unknown>
  ) => unknown
}

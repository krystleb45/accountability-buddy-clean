declare module 'logrocket' {
  interface LogRocket {
    init(appId: string): void;
    identify(userId: string, userInfo?: Record<string, unknown>): void;
    track(eventName: string): void;
    getSessionURL(callback: (sessionURL: string) => void): void;
    log(message: string): void;
  }

  const logrocket: LogRocket;
  export default logrocket;
}

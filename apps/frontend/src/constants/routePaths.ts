export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  REGISTER: "/register",
  GOALS: "/goals",
  GOAL_DETAIL: (id: string) => `/goals/${id}`,
  TASKS: "/tasks",
  PROFILE: "/profile",
} as const
export type Route = (typeof ROUTES)[keyof typeof ROUTES]

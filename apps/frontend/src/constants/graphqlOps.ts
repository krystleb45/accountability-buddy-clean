// src/constants/graphqlOps.ts
export const GQL_OPS = {
  GET_USER: "GetUser",
  LIST_GOALS: "ListGoals",
  CREATE_TASK: "CreateTask",
  // …
} as const
export type GQLOp = (typeof GQL_OPS)[keyof typeof GQL_OPS]

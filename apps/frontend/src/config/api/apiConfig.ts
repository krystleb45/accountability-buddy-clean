// src/config/api/apiConfig.ts

// ——————————————————————————————————————————
// 1) Strongly-typed endpoint groups
// ——————————————————————————————————————————
export interface AuthEndpoints {
  LOGIN: string
  REGISTER: string
  LOGOUT: string
  REFRESH_TOKEN: string
}

export interface UserEndpoints {
  GET_USER: string
  UPDATE_USER: string
  DELETE_USER: string
  CHANGE_PASSWORD: string
}

export interface TaskEndpoints {
  GET_TASKS: string
  CREATE_TASK: string
  UPDATE_TASK: string
  DELETE_TASK: string
  GET_TASK_BY_ID: string
}

// NEW: subscription endpoints group
export interface SubscriptionEndpoints {
  GET_DETAILS: string
  GET_BILLING_HISTORY: string
  UPDATE: string
  CANCEL: string
}

export interface ApiEndpoints {
  AUTH: AuthEndpoints
  USER: UserEndpoints
  TASKS: TaskEndpoints
  SUBSCRIPTION: SubscriptionEndpoints
}

// ——————————————————————————————————————————
// 2) Concrete URLs
// ——————————————————————————————————————————
export const API_ENDPOINTS: ApiEndpoints = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  USER: {
    GET_USER: "/user",
    UPDATE_USER: "/user/update",
    DELETE_USER: "/user/delete",
    CHANGE_PASSWORD: "/user/change-password",
  },
  TASKS: {
    GET_TASKS: "/tasks",
    CREATE_TASK: "/tasks/create",
    UPDATE_TASK: "/tasks/update",
    DELETE_TASK: "/tasks/delete",
    GET_TASK_BY_ID: "/tasks/:taskId",
  },
  SUBSCRIPTION: {
    GET_DETAILS: "/subscription", // GET current user’s subscription
    GET_BILLING_HISTORY: "/subscription/billing-history",
    UPDATE: "/subscription/update", // POST or PUT to change plan
    CANCEL: "/subscription/cancel", // POST to cancel
  },
}

// ——————————————————————————————————————————
// 3) Build a full URL with path-params & query-params
// ——————————————————————————————————————————
const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000"

export function getApiUrl(
  endpoint: string,
  pathParams: Record<string, string | number> = {},
  queryParams: Record<string, string | number> = {},
): string {
  // interpolate any :placeholders
  let url = BASE + endpoint
  Object.entries(pathParams).forEach(([key, val]) => {
    url = url.replace(`:${key}`, encodeURIComponent(String(val)))
  })
  // strip any remaining placeholders
  url = url.replace(/:\w+/g, "")

  // append query string if present
  const qs = new URLSearchParams(
    Object.entries(queryParams).reduce<Record<string, string>>(
      (acc, [k, v]) => {
        acc[k] = String(v)
        return acc
      },
      {},
    ),
  ).toString()

  return qs ? `${url}?${qs}` : url
}

// ——————————————————————————————————————————
// 4) Example Usage
// ——————————————————————————————————————————
// import { API_ENDPOINTS, getApiUrl } from './apiConfig';
// const detailsUrl = getApiUrl(API_ENDPOINTS.SUBSCRIPTION.GET_DETAILS);
// const billingUrl = getApiUrl(API_ENDPOINTS.SUBSCRIPTION.GET_BILLING_HISTORY);
// await fetch(detailsUrl);
// await post(getApiUrl(API_ENDPOINTS.SUBSCRIPTION.UPDATE), { plan: 'pro' });
// await post(getApiUrl(API_ENDPOINTS.SUBSCRIPTION.CANCEL));

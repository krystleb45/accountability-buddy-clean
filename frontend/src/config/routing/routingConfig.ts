// src/config/routing/routingConfig.ts

// ——————————————————————————————————————————————
// Route Constants
// ——————————————————————————————————————————————

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  TASKS: '/tasks',
  TASK_DETAILS: '/tasks/:id',
  NOT_FOUND: '*',
} as const;

// ——————————————————————————————————————————————
// Types
// ——————————————————————————————————————————————

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
export type UserRole = 'admin' | 'user' | 'guest';

// ——————————————————————————————————————————————
// Routing Configuration Interface
// ——————————————————————————————————————————————

interface RoutingConfig {
  readonly routes: typeof ROUTES;
  readonly protectedRoutes: readonly Route[];
  readonly roleBasedRoutes: Record<UserRole, readonly Route[]>;
  readonly defaultRedirects: {
    readonly authenticated: Route;
    readonly unauthenticated: Route;
  };

  isProtectedRoute(this: RoutingConfig, route: Route): boolean;
  getRoleBasedRoutes(this: RoutingConfig, role: UserRole): readonly Route[];
  getRedirectRoute(this: RoutingConfig, isAuthenticated: boolean): Route;
  generateDynamicRoute(
    this: RoutingConfig,
    route: Route,
    params?: Record<string, string | number>,
  ): string;
}

// ——————————————————————————————————————————————
// Implementation
// ——————————————————————————————————————————————

const routingConfig: RoutingConfig = {
  routes: ROUTES,

  protectedRoutes: Object.values(ROUTES).filter(
    (r) =>
      r !== ROUTES.HOME && r !== ROUTES.LOGIN && r !== ROUTES.REGISTER && r !== ROUTES.NOT_FOUND,
  ) as readonly Route[],

  roleBasedRoutes: {
    admin: [ROUTES.DASHBOARD, ROUTES.SETTINGS, ROUTES.PROFILE, ROUTES.TASKS, ROUTES.TASK_DETAILS],
    user: [ROUTES.DASHBOARD, ROUTES.PROFILE, ROUTES.TASKS, ROUTES.TASK_DETAILS],
    guest: [ROUTES.LOGIN, ROUTES.REGISTER],
  },

  defaultRedirects: {
    authenticated: ROUTES.DASHBOARD,
    unauthenticated: ROUTES.LOGIN,
  },

  isProtectedRoute(this: RoutingConfig, route) {
    return this.protectedRoutes.includes(route);
  },

  getRoleBasedRoutes(this: RoutingConfig, role) {
    return this.roleBasedRoutes[role] ?? this.roleBasedRoutes.guest;
  },

  getRedirectRoute(this: RoutingConfig, isAuthenticated) {
    return isAuthenticated
      ? this.defaultRedirects.authenticated
      : this.defaultRedirects.unauthenticated;
  },

  generateDynamicRoute(this: RoutingConfig, route, params = {}) {
    // Force the reduce initial value and accumulator to be string
    return Object.entries(params).reduce<string>(
      (acc, [key, val]) => acc.replace(`:${key}`, encodeURIComponent(String(val))),
      route,
    );
  },
};

export default routingConfig;

# Admin Documentation

This document outlines the administration features, including how to create admin users, the routing structure in the frontend, how to add new admin routes, and the backend middleware used for protection.

## 1. Adding an Admin User

To create a new admin user, a script is provided in the backend application. This script connects to the database and creates a user with the `admin` role.

**Location:** `apps/backend/src/scripts/create-admin.ts`

**Usage:**

Run the following command from the `apps/backend` directory (or adjust the path from the root):

```bash
# From apps/backend
npx tsx src/scripts/create-admin.ts <username> <email> <password>

# Example
npx tsx src/scripts/create-admin.ts adminUser admin@example.com securePassword123
```

**Prerequisites:**

- Ensure your `.env` file (or `.env.local`, `.env.development`) in `apps/backend` contains the correct `MONGO_URI`.
- The script uses `dotenv-flow` to load environment variables.

## 2. Next.js Routing Structure

The admin interface is built using the Next.js App Router and is located within the frontend application.

**Location:** `apps/frontend/src/app/(authenticated)/admin`

**Structure:**

- **(authenticated):** This route group ensures that the user is logged in (handled by parent layouts/middleware).
- **admin:** This folder contains all admin-specific pages.
- **layout.tsx:** The `AdminLayout` component in `apps/frontend/src/app/(authenticated)/admin/layout.tsx` is responsible for protecting these routes.
  - It retrieves the user session using `getServerSession`.
  - It checks if `session.user.role === "admin"`.
  - If the user is not an admin, they are redirected to `/dashboard`.
  - It also renders the `AdminSidebar` for navigation.

## 3. How to Add New Routes

### Frontend (Next.js)

To add a new page to the admin dashboard:

1. Create a new folder under `apps/frontend/src/app/(authenticated)/admin/`.
    - Example: `apps/frontend/src/app/(authenticated)/admin/users`
2. Create a `page.tsx` file within that folder.
    - Example: `apps/frontend/src/app/(authenticated)/admin/users/page.tsx`
3. The new page will automatically be wrapped by the `AdminLayout`, ensuring it is protected and has the sidebar.

### Backend (Express)

To add a new API endpoint for admin operations:

1. **Create a Controller:**
    - Add a new controller method in `apps/backend/src/api/controllers/`.
    - Example: `adminController.ts`

2. **Create a Route:**
    - Create a new route file in `apps/backend/src/api/routes/` (e.g., `adminRoutes.ts`).
    - Import the `protect` and `restrictTo` middleware.

    ```typescript
    import { Router } from "express";
    import { protect, restrictTo } from "../middleware/auth-middleware";
    import * as adminController from "../controllers/adminController";

    const router = Router();

    // Protect all routes in this file
    router.use(protect);
    router.use(restrictTo("admin"));

    router.get("/users", adminController.getAllUsers);

    export default router;
    ```

3. **Register the Route:**
    - Import and use the new route in `apps/backend/src/app.ts`.

    ```typescript
    import adminRoutes from "./api/routes/adminRoutes";

    // ...
    app.use("/api/admin", adminRoutes);
    ```

## 4. Backend Middleware

The backend uses specific middleware to secure admin endpoints.

**Location:** `apps/backend/src/api/middleware/auth-middleware.ts`

**Key Functions:**

1. **`protect`**:
    - Verifies the JWT token from the `Authorization` header (`Bearer <token>`).
    - Decodes the token to get the user ID.
    - Fetches the user from the database.
    - Attaches the user object to the request (`req.user`).
    - Throws a 401 error if the token is invalid or missing.

2. **`restrictTo(...roles)`**:
    - Accepts a list of allowed roles (e.g., `"admin"`, `"moderator"`).
    - Checks if `req.user.role` matches one of the allowed roles.
    - Throws a 403 Forbidden error if the user does not have the required role.

**Example Usage:**

```typescript
router.delete(
  "/users/:id",
  protect,
  restrictTo("admin"),
  userController.deleteUser
);
```

## 5. Currently Implemented Features

### Backend Routes

The following API endpoints are currently protected and restricted to admins:

**Badges (`/api/badges`)**

- `POST /` - Create a new badge.
- `GET /all` - Retrieve all badges.
- `PUT /:id/icon` - Upload or update a badge icon.
- `GET /:id` - Retrieve a specific badge by ID.
- `PATCH /:id` - Update a specific badge.
- `DELETE /:id` - Delete a specific badge.

**Activities (`/api/activities`)**

- `GET /all` - Retrieve all activities across the platform.

### Frontend Pages

The admin dashboard currently includes the following sections:

- **Dashboard Home:** `apps/frontend/src/app/(authenticated)/admin/page.tsx`
- **Activities Management:** `apps/frontend/src/app/(authenticated)/admin/activities/page.tsx`
- **Badges Management:** `apps/frontend/src/app/(authenticated)/admin/badges/page.tsx`

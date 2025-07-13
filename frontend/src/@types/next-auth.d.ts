// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession()`
   */
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      role?: string;
      accessToken?: string;
    };
  }

  /**
   * Stored in your database
   */
  interface User extends DefaultUser {
    id: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT payload returned by `getToken()`
   */
  interface JWT extends DefaultJWT {
    id: string;
    role?: string;
    accessToken?: string;
  }
}

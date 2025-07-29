// src/app/api/auth/[...nextauth]/route.ts - FIXED VERSION
export const runtime = 'nodejs';

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET');
}
if (!process.env.BACKEND_URL) {
  throw new Error('Missing BACKEND_URL');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        console.log('🔍 [NEXTAUTH] Attempting login for:', credentials.email);

        try {
          const res = await fetch(
            `${process.env.BACKEND_URL}/api/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          console.log('🔍 [NEXTAUTH] Backend login response status:', res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.log('❌ [NEXTAUTH] Login failed:', errorText);
            return null;
          }

          const payload = await res.json();
          console.log('🔍 [NEXTAUTH] Backend login payload keys:', Object.keys(payload));
          console.log('🔍 [NEXTAUTH] Payload structure:', JSON.stringify(payload, null, 2));

          // Handle different possible response formats
          let userData;
          if (payload.data) {
            // Format: { success: true, data: { user: {...}, token: "..." } }
            userData = {
              id: payload.data.user?.id || payload.data.user?._id,
              name: payload.data.user?.name || payload.data.user?.username,
              email: payload.data.user?.email,
              role: payload.data.user?.role || 'user',
              accessToken: payload.data.token || payload.data.accessToken
            };
          } else if (payload.user && payload.token) {
            // Format: { success: true, user: {...}, token: "..." }
            userData = {
              id: payload.user.id || payload.user._id,
              name: payload.user.name || payload.user.username,
              email: payload.user.email,
              role: payload.user.role || 'user',
              accessToken: payload.token
            };
          } else if (payload.id || payload._id) {
            // Format: { id: "...", name: "...", accessToken: "..." }
            userData = {
              id: payload.id || payload._id,
              name: payload.name || payload.username,
              email: payload.email,
              role: payload.role || 'user',
              accessToken: payload.accessToken || payload.token
            };
          } else {
            console.log('❌ [NEXTAUTH] Could not parse user data from payload');
            console.log('🔍 [NEXTAUTH] Available payload keys:', Object.keys(payload));
            return null;
          }

          console.log('🔍 [NEXTAUTH] Extracted user data:', {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            hasAccessToken: !!userData.accessToken,
            tokenPreview: userData.accessToken ? userData.accessToken.substring(0, 20) + '...' : 'none'
          });

          // Validate required fields
          if (!userData.id || !userData.accessToken) {
            console.log('❌ [NEXTAUTH] Missing required fields');
            console.log('🔍 [NEXTAUTH] Has ID:', !!userData.id);
            console.log('🔍 [NEXTAUTH] Has accessToken:', !!userData.accessToken);
            return null;
          }

          console.log('✅ [NEXTAUTH] Login successful, returning user with token');
          return userData as ExtendedUser;

        } catch (error) {
          console.error('❌ [NEXTAUTH] Login error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('🔍 [NEXTAUTH JWT] Storing user in token');
        const u = user as ExtendedUser;
        token.id = u.id;
        token.role = u.role;
        token.accessToken = u.accessToken;
        console.log('🔍 [NEXTAUTH JWT] Token updated:', {
          id: token.id,
          role: token.role,
          hasAccessToken: !!token.accessToken,
          tokenPreview: token.accessToken ? token.accessToken.substring(0, 20) + '...' : 'none'
        });
      } else {
        console.log('🔍 [NEXTAUTH JWT] No user, keeping existing token:', {
          id: token.id,
          hasAccessToken: !!token.accessToken
        });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔍 [NEXTAUTH SESSION] Building session from token:', {
        tokenId: token.id,
        tokenRole: token.role,
        hasAccessToken: !!token.accessToken
      });

      // Work with existing session structure and add our fields
      if (session.user && token.id && token.accessToken) {
        // Cast to any to bypass TypeScript issues temporarily
        const user = session.user as any;
        user.id = token.id as string;
        user.role = token.role as string;
        user.accessToken = token.accessToken as string;
      }

      console.log('🔍 [NEXTAUTH SESSION] Final session:', {
        userId: (session.user as any)?.id,
        userName: session.user?.name,
        userRole: (session.user as any)?.role,
        hasAccessToken: !!(session.user as any)?.accessToken,
        tokenPreview: (session.user as any)?.accessToken ? (session.user as any).accessToken.substring(0, 20) + '...' : 'none'
      });

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: true, // Enable debug mode
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

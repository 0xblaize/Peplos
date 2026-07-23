import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';

export const isGoogleCalendarConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

// Only registering the Google provider when real credentials exist avoids
// constructing it with an undefined clientId/clientSecret, which some
// provider factories reject outright.
const providers: Provider[] = isGoogleCalendarConfigured
  ? [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        authorization: {
          params: {
            scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      }),
    ]
  : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Falls back to an insecure dev-only secret so the demo works without any
  // env vars set. Set AUTH_SECRET (`npx auth secret`) for real deployments.
  secret: process.env.AUTH_SECRET ?? 'peplos-dev-insecure-secret-change-me',
  providers,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.accessToken === 'string') {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});

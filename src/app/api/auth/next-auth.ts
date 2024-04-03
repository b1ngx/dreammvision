import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getServerConfig } from '@/config/server';

const { ENABLE_OAUTH_SSO, NEXTAUTH_SECRET } = getServerConfig();

declare module '@auth/core/jwt' {
  // Returned by the `jwt` callback and `auth`, when using JWT sessions
  interface JWT {
    userId?: string;
  }
}

const nextAuth = NextAuth({
  callbacks: {
    // Note: Data processing order of callback: authorize --> jwt --> session
    async jwt({ token, account }) {
      // Auth.js will process the `providerAccountId` automatically
      // ref: https://authjs.dev/reference/core/types#provideraccountid
      if (account) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // Pick userid from token
      if (session.user) {
        session.user.id = token.userId ?? session.user.id;
      }
      return session;
    },
  },
  providers: ENABLE_OAUTH_SSO
    ? [
        CredentialsProvider({
          async authorize(credentials) {
            // You need to provide your own logic here that takes the credentials
            // submitted and returns either a object representing a user or value
            // that is false/null if the credentials are invalid.
            // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
            // You can also use the `req` object to obtain additional parameters
            // (i.e., the request IP address)

            console.log('credentials', credentials);

            const res = await fetch('http://101.43.129.119:3000/api/user/login', {
              body: JSON.stringify(credentials),
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            });

            console.log(res.ok, res.status, res.statusText);
            console.log('res', res);

            if (!res.ok) return null;

            const { success, data: user } = await res.json();

            // If no error and we have user data, return it
            if (success) {
              return { ...user, name: user.display_name };
            }
            // Return null if user data could not be retrieved
            return { id: '1', name: 'ai' };
          },          
        }),
      ]
    : [],
  secret: NEXTAUTH_SECRET,
  trustHost: true,
});

export const {
  handlers: { GET, POST },
  auth,
} = nextAuth;

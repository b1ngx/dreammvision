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
          async authorize() {
            // You need to provide your own logic here that takes the credentials
            // submitted and returns either a object representing a user or value
            // that is false/null if the credentials are invalid.
            // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
            // You can also use the `req` object to obtain additional parameters
            // (i.e., the request IP address)
            // const res = await fetch('https://www.dreammvision.com:9000/api/user/login', {
            //   body: JSON.stringify(credentials),
            //   headers: { 'Content-Type': 'application/json' },
            //   method: 'POST',
            // });

            // if (!res.ok) return null;

            // const { success, data: user } = await res.json();

            // If no error and we have user data, return it
            // if (res.ok && success) {
            //   return { ...user, name: user.display_name };
            // }
            // Return null if user data could not be retrieved
            return { id: '1', name: 'ai' };
          },
          // The credentials is used to generate a suitable form on the sign in page.
          // You can specify whatever fields you are expecting to be submitted.
          // e.g. domain, username, password, 2FA token, etc.
          // You can pass any HTML attribute to the <input> tag through the object.
          credentials: {
            username: { label: '用户名', type: 'text' },
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            password: { label: '密码', type: 'password' },
          },
          // The name to display on the sign in form (e.g. 'Sign in with...')
          name: 'Credentials',
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

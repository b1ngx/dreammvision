import CredentialsProvider from 'next-auth/providers/credentials';

const provider = {
  id: 'credentials',
  provider: CredentialsProvider({
    async authorize(credentials) {
      const res = await fetch('http://101.43.129.119:3000/api/user/login', {
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      console.log(res.ok, res.status, res.statusText);
      console.log(res);

      if (!res.ok) return null;

      const { success, data: user } = await res.json();

      if (success) {
        // Any object returned will be saved in `user` property of the JWT
        return { ...user, name: user.display_name };
      } else {
        // If you return null then an error will be displayed advising the user to check their details.
        return null;

        // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
      }
    },

    // `credentials` is used to generate a form on the sign in page.
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      password: { label: 'Password', type: 'password' },
      username: { label: 'Username', placeholder: 'jsmith', type: 'text' },
    },
    // The name to display on the sign in form (e.g. "Sign in with...")
    name: 'Credentials',
  }),
};

export default provider;

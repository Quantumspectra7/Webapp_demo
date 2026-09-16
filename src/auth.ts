import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET_KEY,
    }),
  ],
  pages: {
    signIn: "/auth",
  },
});
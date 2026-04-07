import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] authorize called with email:", credentials?.email);

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[AUTH] Missing email or password");
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          console.log("[AUTH] Looking up user:", email);
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("[AUTH] User not found:", email);
            return null;
          }

          if (!user.isActive) {
            console.log("[AUTH] User is inactive:", email);
            return null;
          }

          console.log("[AUTH] Comparing password for:", email);
          const isPasswordValid = await compare(password, user.password);

          if (!isPasswordValid) {
            console.log("[AUTH] Invalid password for:", email);
            return null;
          }

          console.log("[AUTH] Login successful for:", email, "role:", user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

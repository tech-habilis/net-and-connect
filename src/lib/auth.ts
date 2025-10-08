import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { brevoEmailService } from "./brevo";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Fix SSL/host trust issues
  providers: [
    {
      id: "email",
      type: "email",
      name: "Email",
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          await brevoEmailService.sendMagicLink({
            to: email,
            magicLink: url,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    },
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
  session: {
    strategy: "database",
  },
});

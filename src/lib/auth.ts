import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { brevoEmailService } from "./brevo";
import { UserService, UserData } from "@/services/user.service";

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
    async session({ session, user, token }) {
      if (session?.user?.email) {
        // Cache user data to avoid excessive Airtable calls
        if (!session.user.userData) {
          const userData = await UserService.findUserByEmail(
            session.user.email
          );
          if (userData) {
            session.user.userData = userData;
          }
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      // Persist user data in JWT for long-term storage
      if (user) {
        token.userData = user.userData;
      }
      return token;
    },

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
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds - persist until manual logout
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 365 * 24 * 60 * 60, // 1 year - same as session maxAge
      },
    },
  },
});

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    userData?: UserData;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userData?: UserData;
    };
  }
}

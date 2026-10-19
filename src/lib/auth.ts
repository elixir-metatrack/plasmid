import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";

import { db } from "@/db";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app", "*.metatrack.no", "localhost:3000"],
    protocol: "https",
  },
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, role: "user" } }),
      },
    },
  },
  plugins: [admin({ defaultRole: "user" })],
});

export type Session = typeof auth.$Infer.Session;

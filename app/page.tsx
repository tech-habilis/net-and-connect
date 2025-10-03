import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAuthCookie } from "@/lib/magic-link";

// Force Node.js runtime for auth
export const runtime = "nodejs";

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("nc_auth")?.value;

  if (authCookie) {
    const verification = verifyAuthCookie(authCookie);
    if (verification.valid) {
      redirect("/dashboard");
    }
  }

  redirect("/sign-in");
}

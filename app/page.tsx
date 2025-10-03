import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Force Node.js runtime for auth
export const runtime = "nodejs";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }
}

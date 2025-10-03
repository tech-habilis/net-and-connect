import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAuthCookie } from "@/lib/magic-link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MembersTable } from "@/components/dashboard/members-table";
import { EventsList } from "@/components/dashboard/events-list";

// Force Node.js runtime for auth
export const runtime = "nodejs";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("nc_auth")?.value;

  if (!authCookie) {
    redirect("/sign-in");
  }

  const verification = verifyAuthCookie(authCookie);
  if (!verification.valid) {
    redirect("/sign-in");
  }

  // Create a user object with the email from the cookie
  const user = {
    email: verification.email,
    name: verification.email?.split("@")[0],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader user={user} />

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Members Table - Takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2 p-6">
            <MembersTable />
          </div>

          {/* Events List - Takes 1/3 of the width on large screens */}
          <div className="lg:col-span-1">
            <EventsList />
          </div>
        </div>
      </main>
    </div>
  );
}

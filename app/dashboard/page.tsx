import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MembersTable } from "@/components/dashboard/members-table";
import { EventsList } from "@/components/dashboard/events-list";

// Force Node.js runtime for auth
export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members Table - Takes 2/3 of the width on large screens */}
            <div className="lg:col-span-2">
              <MembersTable />
            </div>

            {/* Events List - Takes 1/3 of the width on large screens */}
            <div className="lg:col-span-1">
              <EventsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

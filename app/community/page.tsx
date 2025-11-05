import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAuthCookie } from "@/lib/magic-link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommunityList } from "@/components/dashboard/community-list";

// Force Node.js runtime for auth
export const runtime = "nodejs";

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("nc_auth")?.value;

  if (!authCookie) {
    redirect("/sign-in");
  }

  const verification = verifyAuthCookie(authCookie);
  if (!verification.valid) {
    redirect("/sign-in");
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader />

      {/* Hero Section */}
      <div className="relative py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              NOTRE <span className="text-lime-200">COMMUNAUTE</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              Lorem ipsum dolor sit amet. Qui exercitationem corporis aut
              eveniet beatae ut distinctio autem. At <br /> nulla repellat cum
              nemo provident non obcaecati voluptas. Aut dicta quia et omnis
              consequatur <br />
              vel amet fuga et laborum illum.
            </p>
          </div>
        </div>
      </div>

      {/* Community Content */}
      <main className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <CommunityList />
        </div>
      </main>
    </div>
  );
}

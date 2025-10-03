"use client";

import { Button } from "@/components/ui/button";
import { Globe, Linkedin, LogOut } from "lucide-react";
import Image from "next/image";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const handleSignOut = async () => {
    window.location.href = "/api/auth?req=logout";
  };

  const handleSiteClick = () => {
    window.open("https://net-and-connect.com/", "_blank");
  };

  const handleLinkedInClick = () => {
    window.open("https://www.linkedin.com/company/netandconnect/", "_blank");
  };

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex flex-col">
            <Image
              src="/assets/logo.png"
              alt="Net & Connect"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <p className="text-xs text-gray-500 mt-1">Membres & Événements</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-centerr">
          <button
            onClick={handleSiteClick}
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            style={{
              width: "100px",
              height: "32px",
              borderRadius: "6px",
              paddingTop: "8px",
              paddingRight: "12px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              gap: "4px",
              background: "#FAFAFA",
              border: "1px solid #F2F2F2",
            }}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">Site</span>
          </button>

          <div className="mx-3 h-8 w-px bg-gray-300"></div>

          <button
            onClick={handleLinkedInClick}
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            style={{
              width: "100px",
              height: "32px",
              borderRadius: "6px",
              paddingTop: "8px",
              paddingRight: "12px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              gap: "4px",
              background: "#FAFAFA",
              border: "1px solid #F2F2F2",
            }}
          >
            <Linkedin className="h-4 w-4" />
            <span className="text-sm">LinkedIn</span>
          </button>

          <div className="mx-3 h-8 w-px bg-gray-300"></div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

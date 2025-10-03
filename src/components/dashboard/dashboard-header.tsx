"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in" });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-[#A4D65E] rounded-full p-2 mr-3">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">NET &</h1>
            <h1 className="text-xl font-bold text-gray-900">CONNECT</h1>
            <p className="text-xs text-gray-500 mt-1">Membres & Événements</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#A4D65E]/10 text-[#A4D65E]">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { label: "HOME", path: "/dashboard", active: pathname === "/dashboard" },
    // { label: "NOS ÉVENTS", path: "/events", active: pathname === "/events" },
    { label: "NOS MEMBRES", path: "/members", active: pathname === "/members" },
    { label: "NOS EXPERTS", path: "/experts", active: pathname === "/experts" },
    {
      label: "NOS PARTENAIRES",
      path: "/partners",
      active: pathname === "/partners",
    },
    {
      label: "NOTRE COMMUNAUTÉ",
      path: "/community",
      active: pathname === "/community",
    },
  ];

  const handleSignOut = async () => {
    window.location.href = "/api/auth?req=logout";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-black text-white">
      {/* Left section */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex justify-center px-4">
          <Image
            src="/assets/logo.png"
            alt="NET&CONNECT Logo"
            width={200}
            height={50}
            className="object-contain w-40 h-auto md:w-52"
            unoptimized
          />
        </div>

        {/* Nav links */}
        <div className="flex items-center rounded-xl p-1 bg-[#292828]">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "px-4 py-2 text-lg font-semibold uppercase transition-all duration-200",
                item.active
                  ? "text-white rounded-[10px]"
                  : "text-white/40 hover:text-white"
              )}
              style={
                item.active
                  ? {
                      background: "rgba(239, 249, 210, 0.15)",
                      borderRadius: "10px",
                    }
                  : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* JTEONS Button */}
        <div className="bg-[#EFF9D226] rounded-xl p-1">
          <Button
            variant="ghost"
            className="bg-lime-200 text-black text-lg font-semibold flex items-center gap-2 rounded-xl hover:bg-lime-300"
          >
            <Coins className="w-4 h-4" />
            10 JTEONS
          </Button>
        </div>

        {/* Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="bg-[#EFF9D226] rounded-xl p-1">
              <Image
                src="/assets/avatar-placeholder.png"
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <ChevronDown className="text-white w-4 h-4 mr-1" />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-lime-200 rounded-xl shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-left text-black font-bold text-sm transition-colors rounded-xl mx-2 flex items-center gap-2 cursor-pointer"
                >
                  DECONNEXION
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

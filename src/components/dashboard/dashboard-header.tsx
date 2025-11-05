"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Coins, Menu, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    userData?: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      token: number;
    };
  };
}

export function DashboardHeader() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Use the hook to get fresh user data
  const { user, loading, refetch } = useUserProfile();

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
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-6 py-3 bg-black text-white">
        {/* Left section */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/assets/logo.png"
              alt="NET&CONNECT Logo"
              width={200}
              height={50}
              className="object-contain w-32 h-auto md:w-52"
              unoptimized
            />
          </div>

          {/* Desktop Nav links */}
          <div className="hidden lg:flex items-center rounded-xl p-1 bg-[#292828]">
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
              className="bg-lime-200 text-black text-sm md:text-lg font-semibold flex items-center gap-2 rounded-xl hover:bg-lime-300 px-2 md:px-4"
              onClick={() => refetch()}
              disabled={loading}
            >
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">
                {user?.userData?.token || 0} JTEONS
              </span>
              <span className="sm:hidden">{user?.userData?.token || 0} J.</span>
              {loading && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
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
              <>
                {/* Desktop Version - Just Logout */}
                <div className="md:hidden lg:block absolute right-0 top-full mt-2 w-48 bg-lime-200 rounded-xl shadow-lg z-50">
                  <div className="py-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left text-black font-bold text-sm transition-colors rounded-xl mx-2 cursor-pointer"
                    >
                      DECONNEXION
                    </button>
                  </div>
                </div>

                {/* Mobile Version - Full Screen Navigation Menu */}
                <div
                  className="lg:hidden fixed inset-0 z-50"
                  style={{
                    background: "linear-gradient(to bottom, #171716, #DDFF80)",
                  }}
                >
                  <div className="flex flex-col h-full">
                    {/* Close button */}
                    <div className="flex justify-end p-4">
                      <button
                        onClick={() => setIsDropdownOpen(false)}
                        className="p-2 text-black hover:bg-black hover:bg-opacity-10 rounded-lg"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 px-6 py-8">
                      <div className="space-y-6">
                        {navigationItems.map((item) => (
                          <div key={item.label}>
                            <Link
                              href={item.path}
                              onClick={() => setIsDropdownOpen(false)}
                              className={cn(
                                "block w-full text-left py-4 px-6 text-xl font-bold uppercase transition-all duration-200 rounded-xl",
                                item.active
                                  ? "text-white rounded-xl"
                                  : "text-white hover:bg-white hover:bg-opacity-10"
                              )}
                              style={
                                item.active
                                  ? {
                                      backgroundColor: "#FFFFFF33",
                                    }
                                  : undefined
                              }
                            >
                              {item.label}
                            </Link>
                          </div>
                        ))}

                        {/* Logout option at the bottom for mobile */}
                        <div>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left py-4 px-6 text-xl font-bold uppercase transition-all duration-200 rounded-xl text-white hover:bg-white hover:bg-opacity-10"
                          >
                            DECONNEXION
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 flex justify-between items-center">
                      <p className="text-black text-sm font-medium">
                        DESIGNED BY WEAVER 2025
                      </p>
                      <p className="text-black text-lg font-bold">2025</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-green-400 to-lime-300 transform transition-transform duration-300 ease-in-out z-50 lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-black hover:bg-black hover:bg-opacity-10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-6 py-8">
            <div className="space-y-6">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block w-full text-left py-4 px-6 text-xl font-bold uppercase transition-all duration-200 rounded-xl",
                      item.active
                        ? "bg-white bg-opacity-20 text-black"
                        : "text-black hover:bg-white hover:bg-opacity-10"
                    )}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 text-center">
            <p className="text-black text-sm font-medium">
              DESIGNED BY WEAVER 2025
            </p>
            <p className="text-black text-lg font-bold">2025</p>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Community } from "@/types/dashboard.types";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function CommunityList() {
  const [communityMembers, setCommunityMembers] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCommunity = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/community?req=community&page=1&limit=20`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCommunityMembers(data.community || []);
    } catch (error) {
      console.error("Failed to load community:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-200"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {communityMembers.map((member) => (
        <div
          key={member.id}
          className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800 group cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          {/* Member Image Background */}
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {member.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* CATWALKS Brand Overlay */}
          <div className="absolute top-4 right-4">
            <Image
              src="/assets/catwalks.png"
              alt="CATWALKS"
              width={130}
              height={20}
              unoptimized
            />
          </div>

          {/* Member Info at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="text-white flex center justify-between">
              {/* Name and Title */}
              <div className="flex-1">
                <h3 className="text-xl font-bold uppercase tracking-wide mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-lime-200 uppercase tracking-wide">
                  {member.title}
                </p>
              </div>

              {/* Contact Button */}
              <div className="bg-[#EFF9D226] rounded-xl p-1 h-11">
                <button
                  className="bg-lime-200 text-black px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md hover:bg-lime-300 transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
                  onClick={() => {
                    if (member.email) {
                      window.location.href = `mailto:${member.email}`;
                    } else if (member.phone) {
                      window.location.href = `tel:${member.phone}`;
                    }
                  }}
                >
                  Contacter
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-lime-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Phone, Mail } from "lucide-react";
import { Member } from "@/types/dashboard.types";
import {
  DashboardService,
  MembersPaginationResponse,
} from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export function MembersGrid() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<
    MembersPaginationResponse["pagination"] | null
  >(null);
  const [fallback, setFallback] = useState(false);

  const loadMembers = async (page: number = 1) => {
    setLoading(true);
    try {
      const data = await dashboardService.getMembers(page, 20); // Load more for grid view
      setMembers(data.members);
      setPagination(data.pagination);
      setFallback(data.fallback || false);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
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
      {members.map((member) => (
        <div
          key={member.id}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-300 to-gray-600 group cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          {/* Member Photo/Avatar Background */}
          <div className="aspect-[3/4] relative bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600">
            {/* Placeholder portrait image */}
            <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-600 flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {member.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Company Badge */}
            <div className="absolute top-4 right-4 text-white px-3 py-1 rounded text-md font-medium uppercase">
              CATWALKS
            </div>
          </div>

          {/* Member Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
            {/* Name */}
            <h3 className="text-white text-xl font-bold mb-1 uppercase truncate">
              {member.name}
            </h3>

            {/* Title/Role */}
            <p className="text-[#D0ED8C] text-sm mb-3 uppercase font-bold">
              {member.role}
            </p>

            {/* Development Tag */}
            {/* <div className="mb-4">
              <span className="inline-block bg-lime-200 text-black text-xs font-bold px-3 py-1 rounded uppercase">
                DÉVELOPPEMENT WEB
              </span>
            </div> */}

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-xs">
                <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center text-gray-300 text-xs">
                <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
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

"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { Member } from "@/types/dashboard.types";
import {
  DashboardService,
  MembersPaginationResponse,
} from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export function MembersGrid() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState<
    MembersPaginationResponse["pagination"] | null
  >(null);
  const [fallback, setFallback] = useState(false);

  const membersPerPage = 16; // Suitable for grid layout

  const loadMembers = async (page: number = 1) => {
    setLoading(true);
    try {
      const data = await dashboardService.getMembers(page, membersPerPage);
      setMembers(data.members);
      setPagination(data.pagination);
      setTotalPages(data.pagination?.totalPages || 1);
      setFallback(data.fallback || false);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      await loadMembers(newPage);
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-300 to-gray-600 group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            {/* Member Photo/Avatar Background */}
            <div className="aspect-[3/4] relative bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600">
              {/* Background image or gradient */}
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-600 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
              )}
              {/* Company Badge */}
              {member.company && (
                <div className="absolute top-4 right-4 text-white rounded text-md font-medium uppercase">
                  {member.company}
                </div>
              )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="w-12 h-12 bg-lime-200 rounded-xl flex items-center justify-center hover:bg-[#B5E547] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      )}

      {/* Scroll to top button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 bg-lime-200 rounded-full flex items-center justify-center hover:bg-[#B5E547] transition-colors cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
}

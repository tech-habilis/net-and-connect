"use client";

import { useState, useEffect } from "react";
import { Community } from "@/types/dashboard.types";
import { ArrowUpRight, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { CardGridSkeleton, EmptyState } from "@/components/ui/skeletons";

export function CommunityList() {
  const [communityMembers, setCommunityMembers] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const membersPerPage = 16;

  const loadCommunity = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/community?req=community&page=${page}&limit=${membersPerPage}`,
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

      // Get total pages from the pagination object in the response
      const totalPagesFromAPI = data.pagination?.totalPages || 1;
      const totalCount =
        data.pagination?.totalCount || data.community?.length || 0;

      setTotalPages(totalPagesFromAPI);
    } catch (error) {
      console.error("Failed to load community:", error);
      setCommunityMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      await loadCommunity(newPage);
    }
  };

  useEffect(() => {
    loadCommunity(1);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <CardGridSkeleton count={16} />
      </div>
    );
  }

  if (communityMembers.length === 0) {
    return <EmptyState message="Aucun membre de la communauté disponible" />;
  }

  return (
    <div className="space-y-8">
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

            {/* Company Badge */}
            {member.company && (
              <div className="absolute top-4 right-4 text-white rounded text-md font-medium uppercase">
                {member.company}
              </div>
            )}

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
                {/* <div className="bg-[#EFF9D226] rounded-xl p-1 h-11">
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
                </div> */}
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

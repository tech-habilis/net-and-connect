"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  User,
  AtSign,
  Link,
  Phone,
} from "lucide-react";
import { Member } from "@/types/dashboard.types";
import {
  DashboardService,
  MembersPaginationResponse,
} from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    MembersPaginationResponse["pagination"] | null
  >(null);
  const [fallback, setFallback] = useState(false);
  const itemsPerPage = 10;

  const loadMembers = async (page: number = 1) => {
    setLoading(true);
    try {
      const data = await dashboardService.getMembers(page, itemsPerPage);
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
    loadMembers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Card
        className="h-full border-none flex flex-col"
        style={{ borderRadius: 0 }}
      >
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="text-lg font-medium">Membres</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A4D65E]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="lg:h-[calc(100vh-85px-48px)] border-none flex flex-col py-3"
      style={{ borderRadius: 0 }}
    >
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-lg font-medium text-gray-900">
          Membres
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col h-full">
        {/* Table Container */}
        <div className="flex flex-col flex-1">
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Table with unified horizontal scroll, separate vertical scroll for body */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[600px]">
              {/* Fixed Table Header */}
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: "#77A600" }}>
                          T
                        </span>
                        Membre
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <AtSign
                          className="h-4 w-4"
                          style={{ color: "#77A600" }}
                        />
                        Email
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Link
                          className="h-4 w-4"
                          style={{ color: "#77A600" }}
                        />
                        LinkedIn
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <Phone
                          className="h-4 w-4"
                          style={{ color: "#77A600" }}
                        />
                        Phone
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>

              {/* Scrollable Table Body */}
              <div
                className="overflow-y-auto scrollbar-hide"
                style={{ maxHeight: "300px" }}
              >
                <Table>
                  <TableBody>
                    {members.map((member: Member, index: number) => (
                      <TableRow
                        key={member.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="py-4 min-w-[150px]">
                          <span className="text-sm font-medium text-gray-900">
                            {member.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 min-w-[200px]">
                          <span className="text-sm text-gray-600">
                            {member.email}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 min-w-[120px]">
                          <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            {/* {member.linkedin || "https://www.linkedin.com/..."} */}
                            -
                          </span>
                        </TableCell>
                        <TableCell className="py-4 min-w-[130px]">
                          <span className="text-sm text-gray-600">
                            {member.phone}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination - Sticky at bottom */}
        {pagination && (
          <div className="flex items-center justify-between pt-3 pb-2 border-t border-gray-200 mt-auto">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              Pages {pagination.currentPage} of {pagination.totalPages}
              {/* {fallback && (
                  <span className="text-yellow-600 text-xs">
                    (Using fallback data)
                  </span>
                )} */}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={!pagination.hasPrevPage}
                className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[32px] h-8 px-3 text-sm rounded-md border transition-colors ${
                    currentPage === page
                      ? "bg-[#F1F1F1] text-gray-900 border-gray-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

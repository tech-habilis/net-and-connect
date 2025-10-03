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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Linkedin, Phone } from "lucide-react";
import { Member } from "@/types/dashboard.types";
import { DashboardService } from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await dashboardService.getMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  const totalPages = Math.ceil(members.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = members.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A4D65E]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Membres</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#A4D65E]/10 text-[#A4D65E] text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.name}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {member.linkedin || "https://www.linkedin.com/..."}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Pages {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 ${
                  currentPage === page
                    ? "bg-[#A4D65E] text-white border-[#A4D65E]"
                    : ""
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

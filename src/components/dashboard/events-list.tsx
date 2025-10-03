"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Clock, Search } from "lucide-react";
import { Event } from "@/types/dashboard.types";
import { DashboardService } from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await dashboardService.getUpcomingEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    return { day, month };
  };

  const getDayOfWeek = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Événements à venir</CardTitle>
            <Badge variant="secondary">28</Badge>
          </div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Événements à venir
          </CardTitle>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {filteredEvents.length}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">Tokens available</div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {currentEvents.map((event) => {
            const { day, month } = formatDate(event.date);
            const dayOfWeek = getDayOfWeek(event.date);

            return (
              <div
                key={event.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Date */}
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase">
                    {dayOfWeek}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{day}</div>
                  <div className="text-xs text-gray-500 uppercase">{month}</div>
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
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
        )}
      </CardContent>
    </Card>
  );
}

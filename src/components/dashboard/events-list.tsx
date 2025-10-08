"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Search, ChevronRight } from "lucide-react";
import { Event } from "@/types/dashboard.types";
import { DashboardService } from "@/services/dashboard.service";

const dashboardService = new DashboardService();

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [fallback, setFallback] = useState(false);

  const loadEvents = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/events?req=events&page=${page}&limit=${limit}`,
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
      setEvents(data.events || []);
      setPagination(data.pagination || pagination);
      setFallback(data.fallback || false);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(currentPage, 10);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Client-side filtering for search
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // For display, we'll show filtered events (but keep server-side pagination for API calls)
  const displayEvents = searchQuery ? filteredEvents : events;

  const formatEventDate = (isoString: string) => {
    const date = new Date(isoString);
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
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = dayNames[date.getDay()];

    return { day, month, dayOfWeek };
  };

  const formatTime = (startIsoString: string, endIsoString: string) => {
    const startDate = new Date(startIsoString);
    const endDate = new Date(endIsoString);

    const formatSingleTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    return `${formatSingleTime(startDate)} - ${formatSingleTime(endDate)}`;
  };

  if (loading) {
    return (
      <Card className="w-full max-h-[88vh]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900">
              Événements à venir
            </CardTitle>
            {/* <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              28
            </Badge> */}
          </div>
          <div className="text-sm text-gray-500">Tokens available</div>
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
    <Card
      className="w-full border-none h-[calc(100vh-85px)]"
      style={{ borderRadius: 0 }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">
              Événements à venir
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Tokens available :{" "}
              <span className="font-bold">
                {searchQuery ? filteredEvents.length : pagination.total}
              </span>
            </div>
          </div>
          <div className="relative w-48 ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 h-10 rounded-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Events List - Scrollable Container */}
        <div className="h-[55vh] overflow-y-auto scrollbar-hide space-y-3 pr-2">
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {displayEvents.map((event) => {
            const { day, month, dayOfWeek } = formatEventDate(event.start);
            const timeRange = formatTime(event.start, event.end);

            return (
              <div
                key={event.id}
                className="flex items-center border border-[#E3E3E3] rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                style={{ borderRadius: "12px" }}
                onClick={() => window.open(event.url, "_blank")}
              >
                {/* Date Box */}
                <div className="flex flex-col bg-[#F5F5F5] items-center justify-center mr-4 flex-shrink-0 rounded-l-lg py-3 px-4">
                  <div className="text-xs text-gray-500 uppercase font-medium leading-none">
                    {dayOfWeek}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 leading-none my-1">
                    {day}
                  </div>
                  <div className="text-xs text-gray-500 uppercase leading-none">
                    {month}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {event.title}
                  </h3>
                  {/* {event.description && (
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                      {event.description}
                    </p>
                  )} */}
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{timeRange}</span>
                  </div>
                </div>

                {/* Cover Image (if available) */}
                {event.coverImage && (
                  <div className="w-16 h-16 mr-3 flex-shrink-0">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Arrow */}
                <div className="group-hover:text-gray-600 transition-colors mr-3">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination - only show if not searching and there are multiple pages */}
        {!searchQuery && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              Pages {pagination.page} of {pagination.totalPages}
              {/* ({pagination.total} events) */}
              {fallback && (
                <span className="text-yellow-600 text-xs">
                  (Using fallback data)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
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
                disabled={!pagination.hasNext}
                className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search results info */}
        {searchQuery && (
          <div className="mt-6 pt-4 text-sm text-gray-500">
            Found {filteredEvents.length} events matching "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}

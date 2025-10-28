"use client";

import { useState, useEffect } from "react";
import { MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Event } from "@/types/dashboard.types";
import { EventCard } from "./event-card";

export function EventsList() {
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);
  const [allFinishedEvents, setAllFinishedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [finishedPage, setFinishedPage] = useState(1);

  const eventsPerPage = 4;

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?req=events&page=1&limit=50`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFeaturedEvent(data.featured || null);
      setAllUpcomingEvents(data.upcoming || []);
      setAllFinishedEvents(data.finished || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get current page events
  const getCurrentPageEvents = (events: Event[], page: number) => {
    const startIndex = (page - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return events.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = (totalEvents: number) => {
    return Math.ceil(totalEvents / eventsPerPage);
  };

  const upcomingEvents = getCurrentPageEvents(allUpcomingEvents, upcomingPage);
  const finishedEvents = getCurrentPageEvents(allFinishedEvents, finishedPage);
  const upcomingTotalPages = getTotalPages(allUpcomingEvents.length);
  const finishedTotalPages = getTotalPages(allFinishedEvents.length);

  useEffect(() => {
    loadEvents();
  }, []);

  const formatEventDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "SEPT",
      "OCT",
      "NOV",
      "DEC",
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
    ];
    const month = monthNames[date.getMonth()];
    return { day, month };
  };

  const formatTime = (startIsoString: string, endIsoString: string) => {
    const startDate = new Date(startIsoString);
    const endDate = new Date(endIsoString);

    const formatSingleTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}H${minutes}`;
    };

    return `${formatSingleTime(startDate)} À ${formatSingleTime(endDate)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4EF55]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Featured Event - Large Card */}
      {featuredEvent && (
        <div>
          <h2 className="text-white text-xl font-bold mb-6 uppercase tracking-wide">
            <span className="text-white/60">NOS EVENTS</span> DU MOMENT
          </h2>
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-800">
            {featuredEvent.coverImage && (
              <img
                src={featuredEvent.coverImage}
                alt={featuredEvent.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-bold mb-3 uppercase">
                    {featuredEvent.title}
                  </h3>
                  <div className="text-lime-200 text-sm font-medium mb-1 uppercase">
                    LE {formatEventDate(featuredEvent.start).day}{" "}
                    {formatEventDate(featuredEvent.start).month} À{" "}
                    {
                      formatTime(featuredEvent.start, featuredEvent.end).split(
                        " À "
                      )[0]
                    }
                  </div>
                  <div className="text-lime-200 text-sm mb-4 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {featuredEvent.location}
                  </div>
                  <div
                    className="text-gray-300 text-md leading-relaxed max-w-lg line-clamp-5"
                    dangerouslySetInnerHTML={{
                      __html: (featuredEvent.description || "").replace(
                        /\n/g,
                        "<br>"
                      ),
                    }}
                  />
                </div>
                <button
                  onClick={() => window.open(featuredEvent.url, "_blank")}
                  className="bg-lime-200 text-black px-6 py-2 rounded-md font-bold text-sm hover:bg-[#B5E547] transition-colors uppercase cursor-pointer flex items-center gap-2"
                >
                  S’INSCRIRE
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Grid */}
      {allUpcomingEvents.length > 0 && (
        <div>
          <h2 className="text-white text-xl font-bold mb-6 uppercase tracking-wide">
            <span className="text-white/60">NOS EVENTS</span> À VENIR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Upcoming Events Pagination */}
          {upcomingTotalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setUpcomingPage((prev) => Math.max(1, prev - 1))}
                disabled={upcomingPage === 1}
                className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() =>
                  setUpcomingPage((prev) =>
                    Math.min(upcomingTotalPages, prev + 1)
                  )
                }
                disabled={upcomingPage === upcomingTotalPages}
                className="w-12 h-12 bg-[#C4EF55] rounded-xl flex items-center justify-center hover:bg-[#B5E547] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Finished Events Grid */}
      {allFinishedEvents.length > 0 && (
        <div>
          <h2 className="text-white text-xl font-bold mb-6 uppercase tracking-wide">
            <span className="text-white/60">NOS EVENTS</span> TERMINÉS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {finishedEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Finished Events Pagination */}
          {finishedTotalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setFinishedPage((prev) => Math.max(1, prev - 1))}
                disabled={finishedPage === 1}
                className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() =>
                  setFinishedPage((prev) =>
                    Math.min(finishedTotalPages, prev + 1)
                  )
                }
                disabled={finishedPage === finishedTotalPages}
                className="w-12 h-12 bg-[#C4EF55] rounded-xl flex items-center justify-center hover:bg-[#B5E547] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scroll to top button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 bg-[#C4EF55] rounded-full flex items-center justify-center hover:bg-[#B5E547] transition-colors"
        >
          <svg
            className="w-5 h-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

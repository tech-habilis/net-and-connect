"use client";

import { useState, useEffect } from "react";
import { Event } from "@/types/dashboard.types";

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?req=events&page=1&limit=20`, {
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
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Split events for different sections
  const featuredEvent = events[0];
  const upcomingEvents = events.slice(1, 5);
  const finishedEvents = events.slice(5, 10);

  return (
    <div className="space-y-12">
      {/* Featured Event - Large Card */}
      {featuredEvent && (
        <div>
          <h2 className="text-white text-xl font-bold mb-6 uppercase tracking-wide">
            NOS EVENTS DU MOMENT
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-bold mb-3 uppercase">
                    {featuredEvent.title}
                  </h3>
                  <div className="text-[#C4EF55] text-sm font-medium mb-1 uppercase">
                    LE {formatEventDate(featuredEvent.start).day}{" "}
                    {formatEventDate(featuredEvent.start).month} À{" "}
                    {
                      formatTime(featuredEvent.start, featuredEvent.end).split(
                        " À "
                      )[0]
                    }
                  </div>
                  <div className="text-white text-sm mb-4">
                    @ {featuredEvent.location}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-lg">
                    Lorem ipsum sit amet. Qui exercitationem corporis est
                    eveniet beatae ut beatae at nulla dignissimos voluptatibus
                    iste qui molestiae olit, error incididunt ut labore dolore
                    magna aliqua.
                  </p>
                </div>
                <button
                  onClick={() => window.open(featuredEvent.url, "_blank")}
                  className="bg-[#C4EF55] text-black px-6 py-2 rounded-md font-bold text-sm hover:bg-[#B5E547] transition-colors uppercase"
                >
                  EXPLORER →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Grid */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-white text-xl font-bold mb-6 uppercase tracking-wide">
            NOS EVENTS À VENIR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => {
              const { day, month } = formatEventDate(event.start);
              const timeRange = formatTime(event.start, event.end);

              return (
                <div
                  key={event.id}
                  className="relative rounded-xl overflow-hidden aspect-[4/5] bg-gray-800 group cursor-pointer"
                  onClick={() => window.open(event.url, "_blank")}
                >
                  {event.coverImage && (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-lg font-bold mb-2 uppercase">
                      {event.title}
                    </h3>
                    <div className="text-[#C4EF55] text-xs font-medium mb-1 uppercase">
                      LE {day} {month} À {timeRange.split(" À ")[0]}
                    </div>
                    <div className="text-white text-xs mb-3">
                      @ {event.location}
                    </div>
                    <button className="bg-[#C4EF55] text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-[#B5E547] transition-colors uppercase">
                      EXPLORER →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Finished Events Grid */}
      {finishedEvents.length > 0 && (
        <div>
          <h2 className="text-white text-xl font-bold mb-6 uppercase tracking-wide">
            NOS EVENTS TERMINÉS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {finishedEvents.map((event) => {
              const { day, month } = formatEventDate(event.start);
              const timeRange = formatTime(event.start, event.end);

              return (
                <div
                  key={event.id}
                  className="relative rounded-lg overflow-hidden aspect-[4/5] bg-gray-800 group cursor-pointer"
                  onClick={() => window.open(event.url, "_blank")}
                >
                  {event.coverImage && (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white text-sm font-bold mb-1 uppercase line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="text-[#C4EF55] text-xs font-medium mb-1 uppercase">
                      LE {day} {month} À {timeRange.split(" À ")[0]}
                    </div>
                    <button className="bg-[#C4EF55] text-black px-3 py-1 rounded text-xs font-bold hover:bg-[#B5E547] transition-colors uppercase">
                      EXPLORER →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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

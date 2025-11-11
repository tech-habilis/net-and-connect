import { MapPin, ArrowUpRight } from "lucide-react";
import { Event } from "@/types/dashboard.types";
import { useState } from "react";
import { JoinEventModal } from "./join-event-modal";

interface EventCardProps {
  event: Event;
  userEmail?: string;
}

export function EventCard({ event, userEmail }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    return `${formatSingleTime(startDate)} A ${formatSingleTime(endDate)}`;
  };

  const { day, month } = formatEventDate(event.start);
  const timeRange = formatTime(event.start, event.end);

  // Check if event has passed (compare with event end time)
  const eventEndDate = new Date(event.end);
  const currentDate = new Date();
  const isEventActive = eventEndDate > currentDate;

  return (
    <>
      <div
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
        <div className="absolute bottom-4 left-4 right-4 group-hover:bottom-16 transition-all duration-300">
          <h3 className="text-white text-lg font-bold mb-2 uppercase line-clamp-1">
            {event.title}
          </h3>
          <div className="text-lime-200 text-xs font-medium mb-1 uppercase">
            LE {day} {month} A {timeRange.split(" A ")[0]}
          </div>
          <div className="text-lime-200 text-xs mb-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div
            className="text-gray-300 text-md leading-relaxed max-w-lg line-clamp-2 mb-3"
            dangerouslySetInnerHTML={{
              __html: (event.description || "").replace(/\n/g, "<br>"),
            }}
          />
        </div>
        {/* {isEventActive && ( */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                // setIsModalOpen(true);
                window.open(event.url, "_blank");
              }}
              className="bg-lime-200 text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-[#B5E547] transition-colors uppercase flex items-center gap-1 cursor-pointer"
            >
              DECOUVRIR
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        {/* )} */}
      </div>

      {/* Join Event Modal */}
      {userEmail && (
        <JoinEventModal
          event={event}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userEmail={userEmail}
        />
      )}
    </>
  );
}

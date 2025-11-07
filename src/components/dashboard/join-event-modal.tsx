"use client";

import { useState } from "react";
import { X, Calendar, MapPin, Clock, Users } from "lucide-react";
import { Event } from "@/types/dashboard.types";

interface JoinEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function JoinEventModal({
  event,
  isOpen,
  onClose,
  userEmail,
}: JoinEventModalProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error and success state when modal closes
  const handleClose = () => {
    setError(null);
    setJoinSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const formatEventDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (startIso: string, endIso: string) => {
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  const handleJoinEvent = async () => {
    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          req: "join",
          eventId: event.id,
          userEmail: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join event");
      }

      setJoinSuccess(true);
      setTimeout(() => {
        handleClose();
        setJoinSuccess(false);
        // Refresh the page to show updated token count
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            {/* Event Image */}
            {event.coverImage && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Event Details */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">
                {event.title}
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-lime-500" />
                  <span>{formatEventDate(event.start)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-lime-500" />
                  <span>{formatEventTime(event.start, event.end)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-lime-500" />
                  <span>{event.location}</span>
                </div>
              </div>

              {event.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Join Section */}
            {!joinSuccess ? (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-lime-500" />
                  <span className="text-sm text-gray-600">
                    Inscrivez-vous avec: <strong>{userEmail}</strong>
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> L'inscription a cet evenement coutera
                    1 JTEON de votre solde.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-600 text-2xl mb-2">✓</div>
                  <p className="text-sm text-green-800 font-medium">
                    Inscription reussie !
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Vous recevrez une confirmation par email.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!joinSuccess && (
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={handleJoinEvent}
                disabled={isJoining}
                className="inline-flex w-full justify-center rounded-md bg-lime-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {isJoining ? "Inscription..." : "Rejoindre l'evenement"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isJoining}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

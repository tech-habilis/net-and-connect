"use client";

import { useState, useEffect } from "react";
import { Partner } from "@/types/dashboard.types";

export function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/partners?req=partners&page=1&limit=20`,
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
      setPartners(data.partners || []);
    } catch (error) {
      console.error("Failed to load partners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-200"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {partners.map((partner) => (
        <div
          key={partner.id}
          className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-800 group cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          {/* Partner Image Background */}
          {partner.image ? (
            <img
              src={partner.image}
              alt={partner.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {partner.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Partner Title Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-wide text-center">
              {partner.title}
            </h3>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-lime-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
}

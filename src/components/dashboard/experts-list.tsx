"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, ArrowUpRight, Send } from "lucide-react";
import { Expert } from "@/types/dashboard.types";
import Image from "next/image";

export function ExpertsList() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExperts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/experts?req=experts&page=1&limit=20`, {
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
      setExperts(data.experts || []);
    } catch (error) {
      console.error("Failed to load experts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-200"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experts.map((expert) => (
        <div
          key={expert.id}
          className="relative rounded-2xl overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 border border-[#FFFFFF1A]"
        >
          {/* Expert Photo Background */}
          <div className="aspect-[7/8] relative">
            {expert.image ? (
              <img
                src={expert.image}
                alt={expert.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #D4B8A3 0%, #B8956D 50%, #8B6B3D 100%)",
                }}
              >
                <div className="w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {expert.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* CATWALKS Branding - Top Left */}
            <div className="absolute top-6 left-6">
              <Image
                src="/assets/catwalks.png"
                alt="CATWALKS"
                width={130}
                height={20}
                unoptimized
              />
            </div>

            {/* Development Tag - Top Right */}
            <div className="absolute top-6 right-6">
              <span className="bg-lime-200 text-black px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                DÉVELOPPEMENT WEB
              </span>
            </div>

            {/* Overlay for better text readability - Show only top 20% of image */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0.8) 50%, black 75%)",
              }}
            />
          </div>

          {/* Expert Info Overlay - Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="px-6">
              {/* Description Text */}
              <p className="text-white text-sm leading-relaxed line-clamp-3">
                {expert.description}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 my-4"></div>

            {/* Expert Name and Title */}
            <div className="px-6">
              <div className="mb-4">
                <h3 className="text-white text-2xl font-bold mb-1 uppercase tracking-wide">
                  {expert.name}
                </h3>
                <p className="text-gray-300 text-sm uppercase font-medium tracking-wide">
                  {expert.title}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white text-sm">
                    <Phone className="w-4 h-4 mr-3 flex-shrink-0 text-lime-200" />
                    <span>{expert.phone}</span>
                  </div>
                  {/* Action Button */}
                  <div className="bg-[#EFF9D226] rounded-xl p-1">
                    <button className="bg-lime-200 text-black px-4 py-2 rounded-md text-xs font-bold hover:bg-[#B5E547] transition-colors uppercase flex items-center gap-2 tracking-wide">
                      PRENDRE RENDEZ-VOUS
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-white text-sm">
                  <Send className="w-4 h-4 mr-3 flex-shrink-0 text-lime-200 rotate-45" />
                  <span className="truncate">{expert.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-lime-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
}

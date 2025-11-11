"use client";

import { Skeleton } from "@/components/ui/skeleton";

// Card skeleton for community members, experts, etc.
export function CardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800">
      <Skeleton className="w-full h-full bg-gray-700" />

      {/* Company badge skeleton */}
      <div className="absolute top-4 right-4">
        <Skeleton className="h-6 w-20 bg-gray-600" />
      </div>

      {/* Bottom info skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-gray-600" />
          <Skeleton className="h-4 w-24 bg-gray-600" />
        </div>
      </div>
    </div>
  );
}

// Partner card skeleton
export function PartnerCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-800">
      <Skeleton className="w-full h-full bg-gray-700" />

      {/* Title skeleton */}
      <div className="absolute bottom-4 left-4 right-4">
        <Skeleton className="h-6 w-24 bg-gray-600" />
      </div>
    </div>
  );
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-800 p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-gray-600" />
        <Skeleton className="h-4 w-32 bg-gray-600" />
        <Skeleton className="h-4 w-28 bg-gray-600" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-gray-600" />
          <Skeleton className="h-8 w-24 bg-gray-600" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton for members table
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-700">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-600" />
          <Skeleton className="h-4 w-32 bg-gray-600" />
        </div>
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-28 bg-gray-600" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-24 bg-gray-600" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-16 bg-gray-600" />
      </td>
    </tr>
  );
}

// Grid skeleton for multiple cards
export function CardGridSkeleton({
  count = 8,
  cardType = "default",
}: {
  count?: number;
  cardType?: "default" | "partner" | "event";
}) {
  const SkeletonCard =
    cardType === "partner"
      ? PartnerCardSkeleton
      : cardType === "event"
        ? EventCardSkeleton
        : CardSkeleton;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

// Empty state component
export function EmptyState({
  message = "Aucune donnée disponible",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4"
          />
        </svg>
      </div>
      <p className="text-lg font-medium text-gray-300 mb-2">{message}</p>
      <p className="text-sm text-gray-500 max-w-md">
        Les données seront affichées ici dès qu'elles seront disponibles.
      </p>
    </div>
  );
}

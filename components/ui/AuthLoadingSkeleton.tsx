"use client";

import React from "react";

export function AuthLoadingSkeleton() {
  return (
    <div className="flex flex-col h-[100svh] bg-white">
      {/* Header with date */}
      <div className="p-4 flex justify-between items-center">
        <div className="w-36 h-5 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
      </div>

      {/* Journal title */}
      <div className="px-4 py-2">
        <div className="w-40 h-7 bg-gray-200 rounded-md animate-pulse mb-4"></div>
      </div>

      {/* Divider with mood button */}
      <div className="px-4 py-2 flex items-center">
        <div className="flex-1 h-0.5 bg-gray-200"></div>
        <div className="mx-2 px-4 py-1 rounded-full bg-gray-200 animate-pulse w-28 h-8"></div>
        <div className="ml-2 w-10 h-10 rounded-full bg-amber-100 animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 bg-amber-300 rounded-full"></div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-4 py-4 flex-1">
        <div className="w-full h-5 bg-gray-200 rounded-md animate-pulse mb-3"></div>
        <div className="w-3/4 h-5 bg-gray-200 rounded-md animate-pulse mb-3"></div>
        <div className="w-5/6 h-5 bg-gray-200 rounded-md animate-pulse mb-3"></div>
        <div className="w-2/3 h-5 bg-gray-200 rounded-md animate-pulse mb-3"></div>
      </div>

      {/* Voice button */}
      <div className="flex justify-end p-4">
        <div className="w-14 h-14 rounded-full bg-amber-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-8 bg-amber-300 rounded-md"></div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex justify-around items-center p-4 border-t border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded-md animate-pulse mt-1"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-amber-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded-md animate-pulse mt-1"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded-md animate-pulse mt-1"></div>
        </div>
      </div>
    </div>
  );
}

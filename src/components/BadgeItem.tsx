/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AchievementBadge } from "../types";

interface BadgeItemProps {
  badge: AchievementBadge;
  isUnlocked: boolean;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({ badge, isUnlocked }) => {
  return (
    <div
      id={`badge-${badge.id}`}
      className={`relative group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
        isUnlocked
          ? "bg-teal-50/70 border-teal-200/60 shadow-xs hover:shadow-md hover:scale-[1.02] cursor-default"
          : "bg-gray-50/50 border-gray-100 opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
      }`}
    >
      {/* Icon block */}
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl transition-all duration-500 ${
          isUnlocked
            ? "bg-teal-500 text-white animate-pulse"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        {badge.icon}
      </div>

      {/* Title & Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-bold truncate ${
            isUnlocked ? "text-teal-800" : "text-gray-500"
          }`}
        >
          {badge.name}
        </h4>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {badge.description}
        </p>
      </div>

      {/* Unlock Stamp */}
      {isUnlocked && (
        <span className="text-[10px] bg-teal-200 text-teal-800 font-bold px-1.5 py-0.5 rounded-full select-none absolute top-2 right-2 scale-90">
          ĐÃ ĐẠT
        </span>
      )}

      {/* Modern Tooltip on Hover */}
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200">
        <p className="font-bold text-teal-300 text-center mb-1">{badge.name}</p>
        <p className="text-gray-200 text-center leading-relaxed mb-1.5">{badge.description}</p>
        <div className="border-t border-gray-800 pt-1 mt-1">
          <p className="text-[10px] text-gray-400">
            <span className="font-semibold text-amber-300">Yêu cầu:</span> {badge.criteria}
          </p>
          <p className="text-[10px] text-teal-400 mt-0.5">
            Trạng thái: {isUnlocked ? "🟢 Đã hoàn thành" : "🔴 Đang khóa"}
          </p>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

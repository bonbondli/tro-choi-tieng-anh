/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserStats } from "../types";
import { ACHIEVEMENT_BADGES } from "../data/puzzles";
import { BadgeItem } from "./BadgeItem";
import { Award, Trophy, User, Trash2, Edit2, Check, RefreshCw } from "lucide-react";
import { sound } from "./SoundManager";

interface StatsDashboardProps {
  stats: UserStats;
  onResetStats: () => void;
  onUpdateUserName: (name: string) => void;
  userName: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onResetStats,
  onUpdateUserName,
  userName
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setIsEditingName(false);
      sound.playSuccess();
    }
  };

  const completedCount = stats.completedLevels.filter(id => id <= 5).length; // 5 default levels
  const progressPercent = Math.min(100, Math.round((completedCount / 5) * 100));

  return (
    <div id="stats-dashboard-root" className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
      
      {/* Left Bento: Profile & Scores */}
      <div className="md:col-span-1 bg-gradient-to-br from-teal-50 to-emerald-50/50 p-5 rounded-2xl border border-teal-100/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl shadow-md shadow-teal-500/15">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest">Học Sinh</div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={15}
                    className="bg-white border border-teal-300 rounded-md px-1.5 py-0.5 text-sm font-bold text-gray-800 w-28 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-1 bg-teal-500 hover:bg-teal-600 text-white rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-gray-800 text-base">{userName}</span>
                  <button
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className="text-gray-400 hover:text-teal-600 transition-colors p-0.5"
                    title="Đổi tên"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Core Score indicators */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/80 p-3.5 rounded-xl border border-teal-200/20 text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Tổng điểm</div>
              <div className="text-2xl font-bold text-teal-700 font-sans tracking-tight">{stats.totalScore}</div>
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-teal-200/20 text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Kỷ Lục Cao</div>
              <div className="text-2xl font-bold text-amber-600 font-sans tracking-tight flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500 inline" /> {stats.highScore}
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression */}
        <div className="mt-5 pt-4 border-t border-teal-100/40">
          <div className="flex justify-between items-center text-xs font-bold text-teal-800 mb-1.5">
            <span>Tiến Trình 5 Cấp Độ Mặc Định</span>
            <span>{completedCount}/5 ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-teal-200/40 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="mt-5 flex justify-between items-center">
            <button
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xóa tất cả điểm số, kỷ lục và huy hiệu để làm lại từ đầu không?")) {
                  onResetStats();
                }
              }}
              className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa dữ liệu điểm
            </button>
            <span className="text-[10px] text-gray-400 font-medium italic">Lưu tự động vào máy</span>
          </div>
        </div>
      </div>

      {/* Middle & Right Bento: Achievement Badges Collection */}
      <div className="md:col-span-2 flex flex-col">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2.5">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-800 text-sm">Huy Hiệu Học Tập Đã Thu Thập</h3>
          <span className="ml-auto bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
            {stats.badges.length} / {ACHIEVEMENT_BADGES.length} ĐẠT ĐƯỢC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[195px] pr-1 scrollbar-thin">
          {ACHIEVEMENT_BADGES.map((badge) => {
            const isUnlocked = stats.badges.includes(badge.id);
            return <BadgeItem key={badge.id} badge={badge} isUnlocked={isUnlocked} />;
          })}
        </div>
      </div>

    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CrosswordRow {
  id: number;          // 0 to 4
  clue: string;        // Clue in Vietnamese
  word: string;        // Correct answer in English (uppercase)
  keyCharIndex: number;// Index of the letter that belongs to the vertical key word
}

export interface PuzzleLevel {
  id: number;
  theme: string;       // Theme name in Vietnamese
  englishTheme: string;// Theme name in English
  difficulty: "Dễ" | "Trung bình" | "Khó";
  description: string;
  keyWord: string;     // Vertical key word
  rows: CrosswordRow[];
}

export interface UserStats {
  totalScore: number;
  completedLevels: number[]; // level IDs
  highScore: number;
  badges: string[]; // badge IDs earned
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  criteria: string;
}

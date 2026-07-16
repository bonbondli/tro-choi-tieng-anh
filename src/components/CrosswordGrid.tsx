/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { PuzzleLevel } from "../types";
import { sound } from "./SoundManager";
import { Sparkles, HelpCircle } from "lucide-react";

interface CrosswordGridProps {
  level: PuzzleLevel;
  userGridState: { [rowId: number]: string[] };
  activeRow: number | null;
  activeCol: number | null;
  onSelectCell: (rowId: number, colIdx: number) => void;
  onCellChange: (rowId: number, colIdx: number, val: string) => void;
  revealedHints: { [rowId: number]: boolean[] };
  isLevelChecked: boolean;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  level,
  userGridState,
  activeRow,
  activeCol,
  onSelectCell,
  onCellChange,
  revealedHints,
  isLevelChecked
}) => {
  // Find maximum keyCharIndex to calculate vertical alignment padding
  const maxKeyCharIndex = Math.max(...level.rows.map((r) => r.keyCharIndex));

  // We want to calculate the maximum width of the visual grid.
  // Visual width = paddingStart + wordLength
  const visualRowData = level.rows.map((r) => {
    const paddingStart = maxKeyCharIndex - r.keyCharIndex;
    const totalVisualLength = paddingStart + r.word.length;
    return {
      row: r,
      paddingStart,
      totalVisualLength
    };
  });

  const maxVisualWidth = Math.max(...visualRowData.map((d) => d.totalVisualLength));

  // References to keep track of input elements for programmatic focus movement
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Auto focus the active cell when activeRow/activeCol change
  useEffect(() => {
    if (activeRow !== null && activeCol !== null) {
      const refKey = `${activeRow}-${activeCol}`;
      const el = inputRefs.current[refKey];
      if (el) {
        el.focus();
        el.select(); // Highlight existing character for easy overwriting
      }
    }
  }, [activeRow, activeCol]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: number,
    charIdx: number,
    wordLength: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      
      // If the cell is empty, we delete the previous cell and move focus backward
      if (!userGridState[rowId][charIdx]) {
        if (charIdx > 0) {
          onCellChange(rowId, charIdx - 1, "");
          onSelectCell(rowId, charIdx - 1);
          sound.playCellInput();
        }
      } else {
        // Just clear current cell
        onCellChange(rowId, charIdx, "");
        sound.playCellInput();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (charIdx > 0) {
        onSelectCell(rowId, charIdx - 1);
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (charIdx < wordLength - 1) {
        onSelectCell(rowId, charIdx + 1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rowId > 0) {
        // Try to maintain approximate letter index if possible, otherwise select index 0
        const prevRowWord = level.rows[rowId - 1].word;
        const targetCol = Math.min(charIdx, prevRowWord.length - 1);
        onSelectCell(rowId - 1, targetCol);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (rowId < 4) {
        const nextRowWord = level.rows[rowId + 1].word;
        const targetCol = Math.min(charIdx, nextRowWord.length - 1);
        onSelectCell(rowId + 1, targetCol);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowId: number,
    charIdx: number,
    wordLength: number
  ) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (!val) return;

    // Get only the last typed character in case of auto-fill or multiple keys
    const letter = val.slice(-1);
    
    onCellChange(rowId, charIdx, letter);
    sound.playCellInput();

    // Auto focus next cell if we're not at the end of the word
    if (charIdx < wordLength - 1) {
      onSelectCell(rowId, charIdx + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-teal-50/20 rounded-2xl border border-teal-100/30 overflow-x-auto select-none">
      
      {/* Down arrow pointing at Key Word Column */}
      <div className="flex w-full min-w-[320px] justify-center mb-2">
        <div 
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${maxVisualWidth}, minmax(1.75rem, 2.75rem))` }}
        >
          {Array.from({ length: maxVisualWidth }).map((_, colIdx) => {
            const isKeyCol = colIdx === maxKeyCharIndex;
            return (
              <div key={colIdx} className="flex flex-col items-center justify-end h-10">
                {isKeyCol && (
                  <div className="flex flex-col items-center animate-bounce text-amber-500">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded-md shadow-xs mb-1">
                      TỪ KHÓA
                    </span>
                    <Sparkles className="w-4 h-4 fill-amber-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Crossword Grid Matrix */}
      <div className="space-y-1.5 w-full min-w-[320px] flex flex-col items-center">
        {visualRowData.map(({ row, paddingStart }) => {
          const isRowSelected = activeRow === row.id;

          return (
            <div
              key={row.id}
              className={`flex items-center rounded-xl p-1.5 transition-all duration-300 ${
                isRowSelected 
                  ? "bg-teal-500/10 border-l-4 border-l-teal-600 pl-2 shadow-xs" 
                  : "bg-transparent border-l-4 border-l-transparent"
              }`}
            >
              {/* Row Selector Number Indicator */}
              <button
                type="button"
                onClick={() => onSelectCell(row.id, 0)}
                className={`flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs mr-3 transition-all duration-200 ${
                  isRowSelected
                    ? "bg-teal-600 text-white scale-110 shadow-md shadow-teal-600/20"
                    : "bg-white text-teal-700 border border-teal-200/60 hover:bg-teal-50"
                }`}
              >
                {row.id + 1}
              </button>

              {/* Grid cell layout */}
              <div 
                className="grid gap-1 md:gap-1.5"
                style={{ gridTemplateColumns: `repeat(${maxVisualWidth}, minmax(1.75rem, 2.75rem))` }}
              >
                {Array.from({ length: maxVisualWidth }).map((_, colIdx) => {
                  const isPadding = colIdx < paddingStart || colIdx >= paddingStart + row.word.length;
                  
                  if (isPadding) {
                    return <div key={colIdx} className="w-full h-10 bg-transparent rounded-lg"></div>;
                  }

                  // Cell index relative to the English word
                  const letterIdx = colIdx - paddingStart;
                  const letter = userGridState[row.id][letterIdx] || "";
                  const isKeyCell = letterIdx === row.keyCharIndex;
                  const isCellSelected = activeRow === row.id && activeCol === letterIdx;
                  const isHintRevealed = revealedHints[row.id]?.[letterIdx];

                  // Validation classes (green for correct, red for incorrect)
                  let validationClass = "border-gray-200 focus:border-teal-500 bg-white text-gray-800";
                  if (isLevelChecked && letter !== "") {
                    const isCorrect = letter === row.word[letterIdx];
                    validationClass = isCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 focus:ring-emerald-400"
                      : "border-rose-500 bg-rose-50 text-rose-800 focus:ring-rose-400 animate-shake";
                  } else if (isCellSelected) {
                    validationClass = "border-teal-500 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20";
                  } else if (isHintRevealed) {
                    validationClass = "border-amber-300 bg-amber-50 text-amber-800 font-bold";
                  } else if (isKeyCell) {
                    validationClass = "border-amber-400 bg-amber-50/30 text-amber-900 ring-1 ring-amber-300/60 shadow-xs font-semibold";
                  }

                  return (
                    <div key={colIdx} className="relative w-full aspect-square max-h-11">
                      <input
                        ref={(el) => {
                          inputRefs.current[`${row.id}-${letterIdx}`] = el;
                        }}
                        type="text"
                        value={letter}
                        maxLength={1}
                        onKeyDown={(e) => handleKeyDown(e, row.id, letterIdx, row.word.length)}
                        onChange={(e) => handleInputChange(e, row.id, letterIdx, row.word.length)}
                        onClick={() => onSelectCell(row.id, letterIdx)}
                        className={`w-full h-full text-center text-sm md:text-base font-bold uppercase border-2 rounded-xl focus:outline-none transition-all duration-200 select-all ${validationClass}`}
                      />
                      {/* Visual indicator for key character (crown or bottom golden bar) */}
                      {isKeyCell && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-400 rounded-full"></div>
                      )}
                      
                      {/* Hint visual badge */}
                      {isHintRevealed && (
                        <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid instruction footer */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100">
        <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
        <span>Di chuyển bằng <strong>phím mũi tên</strong>, nhấn <strong>Backspace</strong> để xóa lùi.</span>
      </div>

    </div>
  );
};

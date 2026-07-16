/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PuzzleLevel, CrosswordRow } from "../types";
import { sound } from "./SoundManager";
import { PlusCircle, Info, Copy, Check, RotateCcw, Award } from "lucide-react";

interface CustomBuilderProps {
  onPlayCustomLevel: (level: PuzzleLevel) => void;
  onAddBadge: (badgeId: string) => void;
}

export const CustomBuilder: React.FC<CustomBuilderProps> = ({
  onPlayCustomLevel,
  onAddBadge
}) => {
  const [themeName, setThemeName] = useState("");
  const [englishTheme, setEnglishTheme] = useState("");
  const [difficulty, setDifficulty] = useState<"Dễ" | "Trung bình" | "Khó">("Trung bình");
  const [description, setDescription] = useState("");
  const [keyWord, setKeyWord] = useState("LEARN"); // Default 5 letter keyword

  // 5 rows representing the letters of keyWord
  const [rows, setRows] = useState<Array<{ word: string; keyCharIndex: number; clue: string }>>([
    { word: "", keyCharIndex: 0, clue: "" },
    { word: "", keyCharIndex: 0, clue: "" },
    { word: "", keyCharIndex: 0, clue: "" },
    { word: "", keyCharIndex: 0, clue: "" },
    { word: "", keyCharIndex: 0, clue: "" }
  ]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // When keyword changes, reset or update keyCharIndex targets if needed
  useEffect(() => {
    // Ensure keyWord is exactly 5 letters, uppercase
    const cleaned = keyWord.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
    if (cleaned !== keyWord) {
      setKeyWord(cleaned);
    }
  }, [keyWord]);

  // Find occurrences of a letter in a word to help the user align
  const getLetterIndices = (word: string, letter: string): number[] => {
    const indices: number[] = [];
    const upperWord = word.toUpperCase();
    const upperLetter = letter.toUpperCase();
    for (let i = 0; i < upperWord.length; i++) {
      if (upperWord[i] === upperLetter) {
        indices.push(i);
      }
    }
    return indices;
  };

  const handleRowWordChange = (idx: number, val: string) => {
    const updated = [...rows];
    const uppercaseVal = val.toUpperCase().replace(/[^A-Z]/g, "");
    updated[idx].word = uppercaseVal;

    // Auto-select first matching letter index if available
    const targetLetter = keyWord[idx] || "";
    const matches = getLetterIndices(uppercaseVal, targetLetter);
    if (matches.length > 0) {
      updated[idx].keyCharIndex = matches[0];
    } else {
      updated[idx].keyCharIndex = -1; // Invalid
    }

    setRows(updated);
  };

  const handleRowIndexChange = (idx: number, charIdx: number) => {
    const updated = [...rows];
    updated[idx].keyCharIndex = charIdx;
    setRows(updated);
  };

  const handleRowClueChange = (idx: number, val: string) => {
    const updated = [...rows];
    updated[idx].clue = val;
    setRows(updated);
  };

  const resetBuilder = () => {
    setThemeName("");
    setEnglishTheme("");
    setDescription("");
    setKeyWord("LEARN");
    setRows([
      { word: "", keyCharIndex: 0, clue: "" },
      { word: "", keyCharIndex: 0, clue: "" },
      { word: "", keyCharIndex: 0, clue: "" },
      { word: "", keyCharIndex: 0, clue: "" },
      { word: "", keyCharIndex: 0, clue: "" }
    ]);
    setValidationErrors([]);
    setSuccessMessage("");
    setShareLink("");
  };

  const validateAndGenerate = (): PuzzleLevel | null => {
    const errors: string[] = [];

    if (!themeName.trim()) errors.push("Vui lòng nhập tên chủ đề (Tiếng Việt).");
    if (!englishTheme.trim()) errors.push("Vui lòng nhập tên chủ đề bằng Tiếng Anh.");
    if (keyWord.length !== 5) errors.push("Từ khóa chính phải có độ dài đúng 5 ký tự.");

    const formattedRows: CrosswordRow[] = [];

    for (let i = 0; i < 5; i++) {
      const r = rows[i];
      const targetLetter = keyWord[i];

      if (!r.word.trim()) {
        errors.push(`Hàng ngang ${i + 1}: Chưa nhập từ Tiếng Anh.`);
        continue;
      }
      if (!r.clue.trim()) {
        errors.push(`Hàng ngang ${i + 1}: Chưa nhập câu hỏi gợi ý.`);
      }

      const indices = getLetterIndices(r.word, targetLetter);
      if (indices.length === 0) {
        errors.push(`Hàng ngang ${i + 1} ("${r.word}"): Không chứa chữ cái từ khóa "${targetLetter}".`);
      } else if (r.keyCharIndex === -1 || !indices.includes(r.keyCharIndex)) {
        errors.push(`Hàng ngang ${i + 1}: Vị trí liên kết từ khóa không hợp lệ.`);
      } else {
        formattedRows.push({
          id: i,
          clue: r.clue,
          word: r.word,
          keyCharIndex: r.keyCharIndex
        });
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      sound.playFailure();
      return null;
    }

    setValidationErrors([]);

    const newLevel: PuzzleLevel = {
      id: Date.now(), // Generate unique ID
      theme: themeName.trim(),
      englishTheme: englishTheme.trim(),
      difficulty: difficulty,
      description: description.trim() || `Bộ ô chữ tự tạo về chủ đề ${themeName}.`,
      keyWord: keyWord,
      rows: formattedRows
    };

    return newLevel;
  };

  const handleSaveAndPlay = () => {
    const newLevel = validateAndGenerate();
    if (!newLevel) return;

    // Save custom level to localStorage
    try {
      const savedCustomStr = localStorage.getItem("crossword_custom_levels");
      const savedCustom: PuzzleLevel[] = savedCustomStr ? JSON.parse(savedCustomStr) : [];
      savedCustom.push(newLevel);
      localStorage.setItem("crossword_custom_levels", JSON.stringify(savedCustom));
    } catch (e) {
      console.error(e);
    }

    // Generate Shareable Link
    try {
      const jsonStr = JSON.stringify(newLevel);
      // Encode beautifully using UTF-8 safe base64
      const b64 = btoa(encodeURIComponent(jsonStr));
      const shareUrl = `${window.location.origin}${window.location.pathname}?code=${b64}`;
      setShareLink(shareUrl);
    } catch (e) {
      console.error(e);
    }

    setSuccessMessage(`Đã thiết lập thành công ô chữ "${themeName.toUpperCase()}"!`);
    sound.playBadgeUnlocked();
    onAddBadge("creator");

    // Scroll to the success box
    setTimeout(() => {
      document.getElementById("builder-success-box")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    sound.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="custom-builder-root" className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-sm mb-1 uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
            Phòng Sáng Tạo Cho Thầy Cô
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Tự Thiết Kế Ô Chữ Tiếng Anh</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tạo giáo án, thiết kế ô chữ mang dấu ấn lớp học của riêng bạn và chia sẻ tức thì bằng liên kết QR!
          </p>
        </div>
        <button
          onClick={resetBuilder}
          className="flex items-center gap-2 self-start md:self-center px-4 py-2 text-xs font-bold text-gray-500 hover:text-teal-600 hover:bg-teal-50/50 rounded-xl transition-all duration-300 border border-gray-200/60"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Làm lại từ đầu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Level metadata */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50 space-y-4">
            <h3 className="font-bold text-teal-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" /> Thông tin bộ ô chữ
            </h3>

            {/* Theme Vietnamese */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tên Chủ Đề (Tiếng Việt) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="VD: Gia đình, Giáng sinh..."
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200"
              />
            </div>

            {/* Theme English */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tên Chủ Đề (Tiếng Anh) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={englishTheme}
                onChange={(e) => setEnglishTheme(e.target.value)}
                placeholder="VD: Family, Christmas..."
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200"
              />
            </div>

            {/* Difficulty & Keyword */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Độ khó</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-teal-500 transition-all duration-200"
                >
                  <option value="Dễ">Dễ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Khó">Khó</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Từ Chìa Khóa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={keyWord}
                  onChange={(e) => setKeyWord(e.target.value)}
                  placeholder="VD: LEARN"
                  maxLength={5}
                  className="w-full text-sm font-bold tracking-widest bg-white border border-gray-200 rounded-xl px-3 py-2 text-center text-teal-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200"
                />
                <span className="text-[10px] text-gray-400 block text-center mt-1">Đúng 5 chữ cái</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả tóm tắt</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lời giới thiệu hay dặn dò học sinh trước khi chơi..."
                rows={2}
                className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl text-xs text-amber-800 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
              💡 Nguyên lý sắp đặt:
            </h4>
            <p>1. <strong>Từ chìa khóa</strong> gồm 5 chữ cái xếp dọc tương đương 5 hàng ngang.</p>
            <p>2. Khi nhập từ hàng ngang, hãy chắc chắn từ đó <strong>có chứa chữ cái chìa khóa</strong> tương ứng ở vị trí đó.</p>
            <p>3. Chọn đúng vị trí chữ cái để căn chỉnh thẳng hàng dọc hoàn hảo nhé!</p>
          </div>
        </div>

        {/* Right column: 5 Crossword Rows */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50/50 p-4 md:p-5 rounded-2xl border border-gray-100/80">
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              📝 Nội dung 5 từ hàng ngang
            </h3>

            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => {
                const targetLetter = keyWord[idx] || "?";
                const row = rows[idx];
                const matches = getLetterIndices(row.word, targetLetter);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-200/60 bg-white shadow-xs transition-all duration-200 hover:border-teal-200/80"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* Vertical word target letter indicator */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500 text-white font-bold shadow-xs">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-gray-500 font-medium flex-1">
                        Từ hàng ngang phải có chữ cái <span className="font-bold text-teal-600 text-sm">"{targetLetter}"</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Word Input */}
                      <div className="md:col-span-4">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Từ Tiếng Anh</label>
                        <input
                          type="text"
                          value={row.word}
                          onChange={(e) => handleRowWordChange(idx, e.target.value)}
                          placeholder="VD: PENCIL"
                          className="w-full text-sm font-bold tracking-wider bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all duration-150"
                        />
                      </div>

                      {/* Align Selector */}
                      <div className="md:col-span-8">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Vị trí liên kết của chữ "{targetLetter}"
                        </label>
                        {row.word === "" ? (
                          <div className="text-xs text-gray-400 italic py-2">Hãy nhập từ Tiếng Anh ở bên để thiết lập...</div>
                        ) : matches.length === 0 ? (
                          <div className="text-xs text-rose-500 font-semibold py-2">
                            Lỗi: Không tìm thấy chữ "{targetLetter}" trong từ "{row.word}"!
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 py-1">
                            {row.word.split("").map((char, charIdx) => {
                              const isTarget = char === targetLetter;
                              const isSelected = row.keyCharIndex === charIdx;
                              return (
                                <button
                                  key={charIdx}
                                  type="button"
                                  onClick={() => isTarget && handleRowIndexChange(idx, charIdx)}
                                  disabled={!isTarget}
                                  className={`px-2.5 py-1 text-xs rounded font-bold transition-all duration-200 ${
                                    isSelected
                                      ? "bg-amber-500 text-white ring-2 ring-amber-300"
                                      : isTarget
                                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                  }`}
                                  title={isTarget ? `Chọn ký tự ở vị trí ${charIdx + 1}` : "Ký tự không trùng từ khóa"}
                                >
                                  {char} <span className="text-[9px] font-normal text-opacity-80">({charIdx + 1})</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Clue Input */}
                      <div className="md:col-span-12">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Câu gợi ý / Câu hỏi (Tiếng Việt)
                        </label>
                        <input
                          type="text"
                          value={row.clue}
                          onChange={(e) => handleRowClueChange(idx, e.target.value)}
                          placeholder="Nhập câu mô tả hoặc câu hỏi gợi ý để học sinh dễ đoán..."
                          className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:bg-white focus:border-teal-500 transition-all duration-150"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error notifications */}
            {validationErrors.length > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
                <p className="text-sm font-bold text-rose-800">Cần chỉnh sửa các lỗi sau để hoàn tất:</p>
                <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={handleSaveAndPlay}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-5 rounded-xl shadow-md shadow-teal-600/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
              >
                <PlusCircle className="w-5 h-5" /> Khởi Tạo Ô Chữ Ngay!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Board & Share Link */}
      {successMessage && (
        <div
          id="builder-success-box"
          className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-full text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-emerald-950">Tuyệt vời! Thiết kế thành công!</h4>
              <p className="text-emerald-800 text-sm">{successMessage}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              🔗 Chia sẻ cho học sinh hoặc đồng nghiệp:
            </p>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono text-gray-600 select-all focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-teal-600 hover:bg-teal-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Sao chép liên kết
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              * Khi mở liên kết này, trình duyệt của học sinh sẽ tự động nạp màn chơi của thầy cô ngay lập tức mà không cần tài khoản!
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                const parsedLevel = validateAndGenerate();
                if (parsedLevel) {
                  onPlayCustomLevel(parsedLevel);
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all duration-300 shadow-md shadow-amber-500/10 hover:scale-[1.02]"
            >
              🎮 CHƠI MÀN CHỮ NÀY NGAY LẬP TỨC
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

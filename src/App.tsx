/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { PuzzleLevel, UserStats, CrosswordRow } from "./types";
import { PRESET_LEVELS, ACHIEVEMENT_BADGES } from "./data/puzzles";
import { CrosswordGrid } from "./components/CrosswordGrid";
import { StatsDashboard } from "./components/StatsDashboard";
import { CustomBuilder } from "./components/CustomBuilder";
import { sound } from "./components/SoundManager";
import {
  Volume2,
  VolumeX,
  Trophy,
  ArrowRight,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Sparkle
} from "lucide-react";

export default function App() {
  // --- STATE ---
  const [levels, setLevels] = useState<PuzzleLevel[]>(PRESET_LEVELS);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [sharedLevel, setSharedLevel] = useState<PuzzleLevel | null>(null);

  // User Stats & Profiles
  const [userName, setUserName] = useState<string>("Học viên năng động");
  const [stats, setStats] = useState<UserStats>({
    totalScore: 0,
    completedLevels: [],
    highScore: 0,
    badges: []
  });

  // Active game play state
  const [userGridState, setUserGridState] = useState<{ [rowId: number]: string[] }>({});
  const [activeRow, setActiveRow] = useState<number | null>(0);
  const [activeCol, setActiveCol] = useState<number | null>(0);
  const [revealedHints, setRevealedHints] = useState<{ [rowId: number]: boolean[] }>({});
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  
  // Quick Input Box for current active row
  const [quickInputVal, setQuickInputVal] = useState<string>("");

  // Sound Muted status
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuteState());

  // Game flow control
  const [isLevelChecked, setIsLevelChecked] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  // References for Canvas effects (Simple Confetti)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Fetch the selected level object
  const currentLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];

  // --- INITIAL LOAD: LOCALSTORAGE & URL SHARING ---
  useEffect(() => {
    // 1. Load User Stats
    const savedStats = localStorage.getItem("crossword_stats");
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse user stats", e);
      }
    }

    // 2. Load User Name
    const savedName = localStorage.getItem("crossword_username");
    if (savedName) {
      setUserName(savedName);
    }

    // 3. Load Saved Custom Levels (if any)
    const savedCustomStr = localStorage.getItem("crossword_custom_levels");
    if (savedCustomStr) {
      try {
        const savedCustom: PuzzleLevel[] = JSON.parse(savedCustomStr);
        setLevels([...PRESET_LEVELS, ...savedCustom]);
      } catch (e) {
        console.error("Failed to parse saved custom levels", e);
      }
    }

    // 4. Check for Shared URL code (?code=...)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      try {
        const jsonStr = decodeURIComponent(atob(code));
        const parsedLevel: PuzzleLevel = JSON.parse(jsonStr);
        if (parsedLevel && parsedLevel.rows && parsedLevel.rows.length === 5) {
          // Set as shared level
          setSharedLevel(parsedLevel);
          // Add to levels list if not already there
          setLevels((prev) => {
            if (prev.some((l) => l.id === parsedLevel.id)) return prev;
            return [...prev, parsedLevel];
          });
          // Play immediately
          setSelectedLevelId(parsedLevel.id);
        }
      } catch (e) {
        console.warn("Failed to decode shared level from URL parameter", e);
      }
    }
  }, []);

  // --- INIT GAME GRID FOR LEVEL ---
  useEffect(() => {
    if (!currentLevel) return;

    // Initialize blank grid state based on correct word lengths
    const initialGrid: { [rowId: number]: string[] } = {};
    const initialHints: { [rowId: number]: boolean[] } = {};

    currentLevel.rows.forEach((r) => {
      initialGrid[r.id] = Array(r.word.length).fill("");
      initialHints[r.id] = Array(r.word.length).fill(false);
    });

    setUserGridState(initialGrid);
    setRevealedHints(initialHints);
    setActiveRow(0);
    setActiveCol(0);
    setQuickInputVal("");
    setIsLevelChecked(false);
    setShowVictoryModal(false);
    setHintsUsedCount(0);
  }, [selectedLevelId, levels]);

  // Sync quick input box with active row text changes
  useEffect(() => {
    if (activeRow !== null && userGridState[activeRow]) {
      const currentWordText = userGridState[activeRow].join("");
      setQuickInputVal(currentWordText);
    }
  }, [activeRow, userGridState]);

  // --- AUDIO TOGGLE ---
  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // --- RESET STATE ---
  const handleResetStats = () => {
    const defaultStats: UserStats = {
      totalScore: 0,
      completedLevels: [],
      highScore: 0,
      badges: []
    };
    setStats(defaultStats);
    setUserName("Học viên mới");
    localStorage.removeItem("crossword_stats");
    localStorage.removeItem("crossword_username");
    localStorage.removeItem("crossword_custom_levels");
    setLevels(PRESET_LEVELS);
    setSelectedLevelId(1);
    sound.playFailure();
  };

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    localStorage.setItem("crossword_username", newName);
  };

  // --- ADD EARNED ACHIEVEMENT BADGES ---
  const handleAddBadge = (badgeId: string) => {
    setStats((prev) => {
      if (prev.badges.includes(badgeId)) return prev;
      
      const updatedBadges = [...prev.badges, badgeId];
      const updated = { ...prev, badges: updatedBadges };
      
      localStorage.setItem("crossword_stats", JSON.stringify(updated));
      
      // Delay to play high badge unlocked sound
      setTimeout(() => {
        sound.playBadgeUnlocked();
      }, 600);

      return updated;
    });
  };

  // --- CELL INTERACTIVE ACTION HANDLERS ---
  const handleSelectCell = (rowId: number, colIdx: number) => {
    setActiveRow(rowId);
    setActiveCol(colIdx);
  };

  const handleCellChange = (rowId: number, colIdx: number, val: string) => {
    setUserGridState((prev) => {
      const rowState = [...prev[rowId]];
      rowState[colIdx] = val;
      return { ...prev, [rowId]: rowState };
    });
  };

  // --- QUICK WHOLE-WORD ENTER FOR ACTIVE ROW ---
  const handleQuickInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRow === null) return;

    const rowObj = currentLevel.rows[activeRow];
    const cleanWord = quickInputVal.toUpperCase().replace(/[^A-Z]/g, "").slice(0, rowObj.word.length);
    
    setUserGridState((prev) => {
      const updatedRow = Array(rowObj.word.length).fill("");
      for (let i = 0; i < cleanWord.length; i++) {
        updatedRow[i] = cleanWord[i];
      }
      return { ...prev, [activeRow]: updatedRow };
    });

    sound.playSuccess();

    // Auto move to next row if not last row, or select first cell of this row
    if (activeRow < 4) {
      setActiveRow(activeRow + 1);
      setActiveCol(0);
    } else {
      setActiveCol(0);
    }
  };

  // --- GET HINT (REVEAL 1 RANDOM CHARACTER) ---
  const handleRevealLetterHint = () => {
    if (activeRow === null || activeCol === null) return;
    
    const rowObj = currentLevel.rows[activeRow];
    const letterToReveal = rowObj.word[activeCol];

    // Mark as revealed
    setRevealedHints((prev) => {
      const rowHints = [...prev[activeRow]];
      rowHints[activeCol] = true;
      return { ...prev, [activeRow]: rowHints };
    });

    // Write into user state
    setUserGridState((prev) => {
      const rowState = [...prev[activeRow]];
      rowState[activeCol] = letterToReveal;
      return { ...prev, [activeRow]: rowState };
    });

    setHintsUsedCount((prev) => prev + 1);
    sound.playCellInput();
  };

  // --- CHECK INDIVIDUAL CURRENT ROW ANSWER ---
  const handleCheckCurrentRow = () => {
    if (activeRow === null) return;
    setIsLevelChecked(true);

    const userWord = userGridState[activeRow].join("");
    const correctWord = currentLevel.rows[activeRow].word;

    if (userWord === correctWord) {
      sound.playSuccess();
    } else {
      sound.playFailure();
    }
  };

  // --- CHECK ALL GRID CELLS ---
  const handleCheckAllAnswers = () => {
    setIsLevelChecked(true);

    let allRowsCorrect = true;
    let anyEmpty = false;

    currentLevel.rows.forEach((r) => {
      const userWord = userGridState[r.id].join("");
      if (userWord.length < r.word.length) {
        anyEmpty = true;
      }
      if (userWord !== r.word) {
        allRowsCorrect = false;
      }
    });

    if (allRowsCorrect) {
      // Level Complete Victory!
      const levelAlreadySolved = stats.completedLevels.includes(currentLevel.id);
      
      // Compute score
      // Preset row value = 100 points, penalty -10 points per hint used
      // Minimum points per row = 20 points
      let calculatedPoints = 0;
      currentLevel.rows.forEach((r) => {
        const hintsForThisRow = revealedHints[r.id]?.filter(Boolean).length || 0;
        const rowPoints = Math.max(20, 100 - hintsForThisRow * 15);
        calculatedPoints += rowPoints;
      });

      // Completion bonus
      calculatedPoints += 150;

      // If already solved, award 50% points to prevent exploit
      if (levelAlreadySolved) {
        calculatedPoints = Math.round(calculatedPoints * 0.3);
      }

      setEarnedPoints(calculatedPoints);
      setShowVictoryModal(true);
      sound.playLevelComplete();

      // Update User Stats
      const updatedScore = stats.totalScore + calculatedPoints;
      const updatedCompleted = levelAlreadySolved
        ? stats.completedLevels
        : [...stats.completedLevels, currentLevel.id];
      const updatedHighScore = Math.max(stats.highScore, updatedScore);

      // Evaluate Achievements Badge unlock trigger
      const updatedBadges = [...stats.badges];
      
      // 1. First Win Badge
      if (updatedCompleted.length >= 1 && !updatedBadges.includes("first_win")) {
        updatedBadges.push("first_win");
      }
      // 2. Score 500 Badge
      if (updatedScore >= 500 && !updatedBadges.includes("score_500")) {
        updatedBadges.push("score_500");
      }
      // 3. No Hints Badge
      if (hintsUsedCount === 0 && !updatedBadges.includes("no_hints")) {
        updatedBadges.push("no_hints");
      }
      // 4. All Preloaded levels completed Badge
      const hasAllDefault = [1, 2, 3, 4, 5].every((id) => updatedCompleted.includes(id));
      if (hasAllDefault && !updatedBadges.includes("all_completed")) {
        updatedBadges.push("all_completed");
      }

      const nextStats = {
        totalScore: updatedScore,
        completedLevels: updatedCompleted,
        highScore: updatedHighScore,
        badges: updatedBadges
      };

      setStats(nextStats);
      localStorage.setItem("crossword_stats", JSON.stringify(nextStats));

      // Launch Confetti
      setTimeout(() => {
        triggerConfettiEffect();
      }, 200);

    } else {
      sound.playFailure();
      if (anyEmpty) {
        alert("Có một vài ô chữ vẫn đang để trống! Hãy tiếp tục điền để hoàn tất nhé.");
      } else {
        alert("Có đáp án chưa chính xác (màu đỏ). Hãy kiểm tra và điều chỉnh lại chữ cái!");
      }
    }
  };

  // --- REPLAY / RE-CLEAR CURRENT LEVEL ---
  const handleClearCurrentLevel = () => {
    if (confirm("Bạn có muốn xóa toàn bộ chữ cái đã nhập trên ô chữ này để chơi lại từ đầu?")) {
      const initialGrid: { [rowId: number]: string[] } = {};
      const initialHints: { [rowId: number]: boolean[] } = {};

      currentLevel.rows.forEach((r) => {
        initialGrid[r.id] = Array(r.word.length).fill("");
        initialHints[r.id] = Array(r.word.length).fill(false);
      });

      setUserGridState(initialGrid);
      setRevealedHints(initialHints);
      setActiveRow(0);
      setActiveCol(0);
      setQuickInputVal("");
      setIsLevelChecked(false);
      setHintsUsedCount(0);
      sound.playSuccess();
    }
  };

  // --- SHARING URL SETUP ---
  const handlePlayCustomLevelFromBuilder = (newLevel: PuzzleLevel) => {
    // Inject custom level into state levels array
    setLevels((prev) => {
      if (prev.some((l) => l.id === newLevel.id)) return prev;
      return [...prev, newLevel];
    });
    setSelectedLevelId(newLevel.id);
    setShowVictoryModal(false);
  };

  // --- CONFETTI ANIMATION LOOP ---
  const triggerConfettiEffect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset sizes
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      color: string;
      radius: number;
      dx: number;
      dy: number;
      tilt: number;
    }> = [];

    const colors = ["#0d9488", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 5 + 4,
        dx: Math.random() * 4 - 2,
        dy: Math.random() * 4 + 3,
        tilt: Math.random() * 10 - 5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let finished = true;
      particles.forEach((p) => {
        p.y += p.dy;
        p.x += p.dx;
        p.tilt += 0.05;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.y < canvas.height) {
          finished = false;
        } else {
          // Wrap around for looping feel
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Terminate after 6 seconds to save system CPU resources
    setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        const activeCtx = canvasRef.current?.getContext("2d");
        if (activeCtx) {
          activeCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 pb-12 antialiased">
      
      {/* Background Confetti Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      />

      {/* Top Header Row Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/80 px-4 py-3.5 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant Logo badge */}
            <div className="bg-teal-600 text-white rounded-2xl w-10 h-10 flex items-center justify-center font-black text-lg shadow-md shadow-teal-600/15">
              🧩
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                Giải Mã Ô Chữ <span className="text-teal-600 font-extrabold font-sans">English</span>
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium hidden sm:block">
                Học từ vựng Tiếng Anh THCS siêu trực quan • Bento UI
              </p>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Audio speaker toggler */}
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                isMuted
                  ? "border-gray-200 text-gray-400 hover:text-rose-500 hover:bg-rose-50"
                  : "border-teal-200 bg-teal-50/50 text-teal-600 hover:bg-teal-50"
              }`}
              title={isMuted ? "Bật âm thanh trò chơi" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Total score bubble */}
            <div className="flex items-center gap-2 bg-teal-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-teal-500/15">
              <Trophy className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              <span>SCORE: {stats.totalScore}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        
        {/* LEVEL SELECTOR HUB ROW */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" /> Bản đồ khóa học
              </h3>
              <h2 className="text-lg font-bold text-gray-800">Chọn chủ đề giải mã từ vựng</h2>
            </div>
            {sharedLevel && (
              <span className="self-start sm:self-center bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                🎮 Đang mở phòng chia sẻ từ Thầy Cô!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {levels.map((lvl) => {
              const isSelected = lvl.id === selectedLevelId;
              const isDefault = lvl.id <= 5;
              const isCompleted = stats.completedLevels.includes(lvl.id);
              
              let difficultyColor = "bg-green-100 text-green-800";
              if (lvl.difficulty === "Trung bình") difficultyColor = "bg-amber-100 text-amber-800";
              if (lvl.difficulty === "Khó") difficultyColor = "bg-rose-100 text-rose-800";

              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setSelectedLevelId(lvl.id);
                    sound.playSuccess();
                  }}
                  className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 text-left min-w-[210px] ${
                    isSelected
                      ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/15 scale-[1.02]"
                      : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-white hover:border-teal-200 hover:shadow-xs"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isSelected ? "bg-white/20 text-white" : "bg-teal-50 text-teal-700"
                  }`}>
                    {isCompleted ? "✅" : isDefault ? lvl.id : "🏫"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-white/20 text-white" : difficultyColor
                      }`}>
                        {lvl.difficulty}
                      </span>
                      {!isDefault && (
                        <span className="text-[9px] font-bold text-rose-500 uppercase">TỰ TẠO</span>
                      )}
                    </div>
                    <p className={`text-sm font-bold truncate mt-1 ${isSelected ? "text-white" : "text-gray-800"}`}>
                      {lvl.theme}
                    </p>
                    <p className={`text-[10px] truncate ${isSelected ? "text-teal-100" : "text-gray-400"}`}>
                      {lvl.englishTheme}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CORE INTERACTIVE WORKSPACE: BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* BENTO 1: Left Grid Playboard (Column Span 7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Màn chơi số {currentLevel.id <= 5 ? currentLevel.id : "Tùy biến"}</span>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                  Chủ đề: {currentLevel.theme}
                  <span className="text-xs font-normal text-gray-400">({currentLevel.englishTheme})</span>
                </h2>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                currentLevel.difficulty === "Dễ" ? "bg-green-50 text-green-700 border border-green-100" :
                currentLevel.difficulty === "Trung bình" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                "bg-rose-50 text-rose-700 border border-rose-100"
              }`}>
                Độ khó: {currentLevel.difficulty}
              </span>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed italic bg-teal-50/30 p-3 rounded-xl border border-teal-100/10">
              "{currentLevel.description}"
            </p>

            {/* The interactive matrix crossword cells */}
            <CrosswordGrid
              level={currentLevel}
              userGridState={userGridState}
              activeRow={activeRow}
              activeCol={activeCol}
              onSelectCell={handleSelectCell}
              onCellChange={handleCellChange}
              revealedHints={revealedHints}
              isLevelChecked={isLevelChecked}
            />

            {/* Quick reset level buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleClearCurrentLevel}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-600 font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa sạch chữ cái đã điền
              </button>
              <div className="text-[11px] text-gray-400 font-medium">
                Gợi ý đã xem: <span className="font-bold text-amber-600">{hintsUsedCount} ký tự</span>
              </div>
            </div>
          </div>

          {/* BENTO 2: Right Interactive Control & Clue Board (Column Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-xs flex flex-col justify-between self-stretch">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-800 text-sm">Danh Sách Câu Hỏi Gợi Ý</h3>
              </div>

              {/* 5 Rows of clues */}
              <div className="space-y-2.5">
                {currentLevel.rows.map((r) => {
                  const isSelected = activeRow === r.id;
                  const wordState = userGridState[r.id] ? userGridState[r.id].join("") : "";
                  const isCorrect = isLevelChecked && wordState === r.word;
                  const isIncorrect = isLevelChecked && wordState !== r.word && wordState.length > 0;
                  
                  let statusBadge = null;
                  if (isCorrect) {
                    statusBadge = <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded ml-auto">ĐÚNG</span>;
                  } else if (isIncorrect) {
                    statusBadge = <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded ml-auto">SAI</span>;
                  } else if (wordState.length === r.word.length) {
                    statusBadge = <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded ml-auto">ĐÃ ĐẦY</span>;
                  } else if (wordState.length > 0) {
                    statusBadge = <span className="text-[9px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded ml-auto">ĐANG ĐIỀN</span>;
                  }

                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectCell(r.id, 0)}
                      className={`w-full text-left p-3 rounded-xl border flex gap-3 transition-all duration-300 ${
                        isSelected
                          ? "bg-teal-600 border-teal-600 text-white shadow-md scale-[1.01]"
                          : "bg-gray-50 border-gray-100/70 hover:border-teal-200 hover:bg-teal-50/10 text-gray-700"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800"
                      }`}>
                        {r.id + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed font-medium ${isSelected ? "text-teal-50" : "text-gray-600"}`}>
                          {r.clue}
                        </p>
                        <p className={`text-[10px] font-extrabold uppercase mt-1 tracking-wider ${isSelected ? "text-amber-300" : "text-teal-600"}`}>
                          ({r.word.length} chữ cái • liên kết vị trí {r.keyCharIndex + 1})
                        </p>
                      </div>
                      {statusBadge}
                    </button>
                  );
                })}
              </div>

              {/* QUICK ANSWER DIALOG FOR ACTIVE ROW */}
              {activeRow !== null && (
                <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-100/40 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider">
                      Nhập nhanh hàng số {activeRow + 1}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Gợi ý: {currentLevel.rows[activeRow].word.length} ô trống
                    </span>
                  </div>

                  <form onSubmit={handleQuickInputSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={quickInputVal}
                      onChange={(e) => setQuickInputVal(e.target.value.toUpperCase())}
                      placeholder={`Nhập từ tiếng Anh...`}
                      maxLength={currentLevel.rows[activeRow].word.length}
                      className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold tracking-widest text-teal-800 placeholder-gray-400 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-300 shadow-xs"
                    >
                      Gửi
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* LOWER CONTROLS PANEL */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Reveal letter hint button */}
                <button
                  type="button"
                  onClick={handleRevealLetterHint}
                  disabled={activeRow === null || activeCol === null}
                  className="flex items-center justify-center gap-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed text-amber-900 font-bold py-2.5 rounded-xl text-xs transition-all duration-300"
                  title="Hiện chữ cái ở ô được chọn (-15 điểm)"
                >
                  <Sparkle className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Gợi ý chữ cái (-15đ)
                </button>

                {/* Check current row */}
                <button
                  type="button"
                  onClick={handleCheckCurrentRow}
                  disabled={activeRow === null}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-teal-400 hover:bg-teal-50/20 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-all duration-300"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  K.Tra Hàng Này
                </button>
              </div>

              {/* BIG BUTTON: Check entire level */}
              <button
                type="button"
                onClick={handleCheckAllAnswers}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black py-3 px-5 rounded-xl shadow-md shadow-teal-600/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
              >
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                KIỂM TRA & HOÀN THÀNH Ô CHỮ!
              </button>
            </div>

          </div>

        </div>

        {/* STATS & BADGES BENTO PANEL */}
        <StatsDashboard
          stats={stats}
          onResetStats={handleResetStats}
          onUpdateUserName={handleUpdateUserName}
          userName={userName}
        />

        {/* CUSTOM CROSSWORD BUILDER SECTION FOR TEACHERS */}
        <CustomBuilder
          onPlayCustomLevel={handlePlayCustomLevelFromBuilder}
          onAddBadge={handleAddBadge}
        />

      </main>

      {/* SUCCESS/VICTORY DIALOG MODAL CARD */}
      {showVictoryModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-amber-200 shadow-2xl relative overflow-hidden animate-scale-up text-center space-y-6">
            
            {/* Crown decoration element */}
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 animate-bounce">
              👑
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-teal-950 tracking-tight">
                Tuyệt Vời! Giải Mã Hoàn Tất!
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Bạn đã giải mã hoàn toàn chính xác toàn bộ ô chữ!
              </p>
            </div>

            {/* GOLDEN PANEL SPECIFYING THE KEY WORD */}
            <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 p-5 rounded-2xl border border-amber-300/60 relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                TỪ CHÌA KHÓA HÀNG DỌC
              </span>
              
              <div className="text-3xl md:text-4xl font-black tracking-[0.5em] text-amber-600 pl-[0.25em] font-sans">
                {currentLevel.keyWord}
              </div>

              {/* Highlighting vocabulary meanings for pedagogical reinforcement */}
              <div className="border-t border-amber-200/40 mt-3 pt-3 text-xs text-amber-950/80 space-y-1">
                {currentLevel.id === 1 && (
                  <p><strong>TEACH</strong> /tiːtʃ/ (verb) • <strong>Dạy học / Giảng dạy</strong></p>
                )}
                {currentLevel.id === 2 && (
                  <p><strong>TIGER</strong> /ˈtaɪ.ɡər/ (noun) • <strong>Con hổ / Cọp</strong></p>
                )}
                {currentLevel.id === 3 && (
                  <p><strong>SWEET</strong> /swiːt/ (adjective) • <strong>Ngọt ngào / Kẹo ngọt</strong></p>
                )}
                {currentLevel.id === 4 && (
                  <p><strong>MATCH</strong> /mætʃ/ (noun) • <strong>Trận đấu thể thao</strong></p>
                )}
                {currentLevel.id === 5 && (
                  <p><strong>GREEN</strong> /ɡriːn/ (adj) • <strong>Xanh lá / Thân thiện môi trường</strong></p>
                )}
                {currentLevel.id > 5 && (
                  <p>Thầy cô đã tạo ô chữ với từ chìa khóa độc đáo: <strong>{currentLevel.keyWord}</strong></p>
                )}
              </div>
            </div>

            {/* Point indicator */}
            <div className="bg-teal-50 text-teal-800 rounded-xl py-3 px-4 inline-flex items-center gap-1.5 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Bạn được cộng: <span className="text-teal-600 font-extrabold">+{earnedPoints}</span> điểm học tập!
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setShowVictoryModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-all duration-300"
              >
                Xem lại lưới chữ
              </button>
              
              {currentLevel.id < levels.length ? (
                <button
                  onClick={() => {
                    // Go to next level
                    const currentIdx = levels.findIndex((l) => l.id === selectedLevelId);
                    if (currentIdx !== -1 && currentIdx < levels.length - 1) {
                      setSelectedLevelId(levels[currentIdx + 1].id);
                    }
                    setShowVictoryModal(false);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-teal-600/10 transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  Chơi chủ đề tiếp theo <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Loop back to Level 1
                    setSelectedLevelId(levels[0].id);
                    setShowVictoryModal(false);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-amber-500/15 transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  Chơi lại từ đầu <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
        <p>© 2026 Giải Mã Ô Chữ Tiếng Anh - Công cụ đồng hành học từ vựng trực quan cho Giáo viên & Học sinh THCS.</p>
        <p className="mt-1">Thiết kế bởi Đội ngũ Lập trình viên AI & Thiết kế Trải nghiệm Học tập.</p>
      </footer>

    </div>
  );
}

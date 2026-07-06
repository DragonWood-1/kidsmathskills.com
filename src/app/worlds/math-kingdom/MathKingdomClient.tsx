"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProblems } from "@/lib/mathProblems";
import { recordAnswer } from "@/lib/gameStore";
import RewardPopup from "@/components/rewards/RewardPopup";

interface KingdomState {
  bricks: number;
  wood: number;
  gold: number;
  walls: number;
  towers: number;
  houses: number;
  market: number;
  garden: number;
}

interface Building {
  id: keyof Omit<KingdomState, "bricks" | "wood" | "gold">;
  label: string;
  emoji: string;
  brickCost: number;
  woodCost: number;
  goldCost: number;
  desc: string;
}

const BUILDINGS: Building[] = [
  { id: "walls", label: "Castle Wall", emoji: "🧱", brickCost: 10, woodCost: 0, goldCost: 0, desc: "Protects your kingdom!" },
  { id: "towers", label: "Watch Tower", emoji: "🗼", brickCost: 8, woodCost: 5, goldCost: 0, desc: "See farther and earn bonus XP!" },
  { id: "houses", label: "Villager House", emoji: "🏠", brickCost: 5, woodCost: 8, goldCost: 2, desc: "More villagers = more gold per round!" },
  { id: "market", label: "Market Square", emoji: "🏪", brickCost: 12, woodCost: 6, goldCost: 5, desc: "Trade resources for bonus coins!" },
  { id: "garden", label: "Magic Garden", emoji: "🌳", brickCost: 3, woodCost: 10, goldCost: 3, desc: "Grows magic resources over time!" },
];

const MATH_TOPICS = [
  { topic: "addition" as const, label: "Addition", emoji: "➕", reward: "bricks" as const },
  { topic: "multiplication" as const, label: "Multiplication", emoji: "✖️", reward: "gold" as const },
  { topic: "subtraction" as const, label: "Subtraction", emoji: "➖", reward: "wood" as const },
  { topic: "division" as const, label: "Division", emoji: "÷", reward: "gold" as const },
];

export default function MathKingdomClient() {
  const [kingdom, setKingdom] = useState<KingdomState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kms_kingdom");
      return saved ? JSON.parse(saved) : { bricks: 5, wood: 5, gold: 2, walls: 0, towers: 0, houses: 0, market: 0, garden: 0 };
    }
    return { bricks: 5, wood: 5, gold: 2, walls: 0, towers: 0, houses: 0, market: 0, garden: 0 };
  });

  const [activeSession, setActiveSession] = useState<typeof MATH_TOPICS[0] | null>(null);
  const [problems, setProblems] = useState<ReturnType<typeof getProblems>>([]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [buildMsg, setBuildMsg] = useState<string | null>(null);

  function saveKingdom(k: KingdomState) {
    setKingdom(k);
    localStorage.setItem("kms_kingdom", JSON.stringify(k));
  }

  function startGathering(topicConfig: typeof MATH_TOPICS[0]) {
    setActiveSession(topicConfig);
    setProblems(getProblems(topicConfig.topic, 1));
    setProblemIndex(0);
    setSelectedOpt(null);
  }

  function handleAnswer(opt: number) {
    if (selectedOpt !== null || !activeSession) return;
    const correct = opt === problems[problemIndex]?.answer;
    setSelectedOpt(opt);
    setLastCorrect(correct);
    setShowReward(true);
    recordAnswer(correct, "math-kingdom");

    if (correct) {
      const k = { ...kingdom };
      k[activeSession.reward] += 3;
      if (k.houses > 0) k.gold += k.houses;
      saveKingdom(k);
    }

    setTimeout(() => {
      setShowReward(false);
      setSelectedOpt(null);
      if (problemIndex + 1 >= problems.length) {
        setProblems(getProblems(activeSession.topic, 1));
        setProblemIndex(0);
      } else {
        setProblemIndex(i => i + 1);
      }
    }, 1100);
  }

  function build(building: Building) {
    if (
      kingdom.bricks < building.brickCost ||
      kingdom.wood < building.woodCost ||
      kingdom.gold < building.goldCost
    ) {
      setBuildMsg("Not enough resources! Gather more first.");
      setTimeout(() => setBuildMsg(null), 2000);
      return;
    }
    const k = { ...kingdom };
    k.bricks -= building.brickCost;
    k.wood -= building.woodCost;
    k.gold -= building.goldCost;
    k[building.id] = (k[building.id] || 0) + 1;
    saveKingdom(k);
    setBuildMsg(`✅ Built ${building.label}!`);
    setTimeout(() => setBuildMsg(null), 2000);
  }

  const currentProblem = problems[problemIndex];

  const kingdomEmoji = () => {
    const total = kingdom.walls + kingdom.towers + kingdom.houses + kingdom.market + kingdom.garden;
    if (total === 0) return "🌱";
    if (total < 3) return "🏚️";
    if (total < 6) return "🏘️";
    if (total < 10) return "🏰";
    return "👑";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-violet-800 to-indigo-900 py-8 px-4">
      <RewardPopup show={showReward} correct={lastCorrect} />

      <div className="max-w-5xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-5xl font-black mb-2">🏰 Math Kingdom</h1>
          <p className="text-purple-200 text-lg">Solve math to gather resources and build your kingdom!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Kingdom view */}
          <div className="lg:col-span-1">
            {/* Resources */}
            <div className="bg-white/10 rounded-3xl p-5 text-white mb-4">
              <h3 className="font-black mb-3">📦 Resources</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-500/30 rounded-xl p-2"><p className="text-2xl">🧱</p><p className="font-black">{kingdom.bricks}</p><p className="text-xs opacity-70">Bricks</p></div>
                <div className="bg-amber-600/30 rounded-xl p-2"><p className="text-2xl">🪵</p><p className="font-black">{kingdom.wood}</p><p className="text-xs opacity-70">Wood</p></div>
                <div className="bg-yellow-500/30 rounded-xl p-2"><p className="text-2xl">🥇</p><p className="font-black">{kingdom.gold}</p><p className="text-xs opacity-70">Gold</p></div>
              </div>
            </div>

            {/* Kingdom display */}
            <div className="bg-white/10 rounded-3xl p-5 text-white mb-4">
              <h3 className="font-black mb-3">🏰 Your Kingdom {kingdomEmoji()}</h3>
              <div className="grid grid-cols-5 gap-1 text-center text-2xl mb-3">
                {Array.from({ length: kingdom.walls }, (_, i) => <span key={`wall-${i}`}>🧱</span>)}
                {Array.from({ length: kingdom.towers }, (_, i) => <span key={`tower-${i}`}>🗼</span>)}
                {Array.from({ length: kingdom.houses }, (_, i) => <span key={`house-${i}`}>🏠</span>)}
                {Array.from({ length: kingdom.market }, (_, i) => <span key={`market-${i}`}>🏪</span>)}
                {Array.from({ length: kingdom.garden }, (_, i) => <span key={`garden-${i}`}>🌳</span>)}
                {kingdom.walls + kingdom.towers + kingdom.houses + kingdom.market + kingdom.garden === 0 && (
                  <p className="text-sm opacity-60 col-span-5">Gather resources to start building!</p>
                )}
              </div>
            </div>

            {/* Build menu */}
            <div className="bg-white/10 rounded-3xl p-5 text-white">
              <h3 className="font-black mb-3">🔨 Build</h3>
              {buildMsg && <div className="bg-white/20 rounded-xl p-2 text-sm mb-3 text-center">{buildMsg}</div>}
              <div className="space-y-2">
                {BUILDINGS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => build(b)}
                    className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 text-left transition-colors text-sm"
                  >
                    <span className="text-2xl">{b.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold">{b.label}</p>
                      <p className="text-xs opacity-70">
                        {b.brickCost > 0 && `🧱${b.brickCost} `}
                        {b.woodCost > 0 && `🪵${b.woodCost} `}
                        {b.goldCost > 0 && `🥇${b.goldCost}`}
                      </p>
                    </div>
                    <span className="text-xs opacity-60">{kingdom[b.id] || 0}×</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Math session */}
          <div className="lg:col-span-2">
            {!activeSession ? (
              <div className="bg-white/10 rounded-3xl p-6 text-white">
                <h3 className="font-black text-xl mb-4">⛏️ Gather Resources</h3>
                <p className="text-purple-200 text-sm mb-5">Solve math problems to collect bricks, wood, and gold for your kingdom!</p>
                <div className="grid grid-cols-2 gap-4">
                  {MATH_TOPICS.map(t => (
                    <motion.button
                      key={t.topic}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => startGathering(t)}
                      className="bg-white/15 hover:bg-white/25 rounded-2xl p-5 text-left transition-colors"
                    >
                      <div className="text-3xl mb-2">{t.emoji}</div>
                      <p className="font-black">{t.label}</p>
                      <p className="text-xs opacity-70 mt-1">Earns {t.reward} 📦</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-3xl p-6 text-white">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeSession.emoji}</span>
                    <div>
                      <p className="font-black">{activeSession.label} Gathering</p>
                      <p className="text-xs text-purple-200">+3 {activeSession.reward} per correct answer</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveSession(null)} className="bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1 text-sm font-bold transition-colors">
                    Stop
                  </button>
                </div>

                {currentProblem && (
                  <div>
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 text-center mb-5">
                      <p className="text-5xl font-black">{currentProblem.question}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {currentProblem.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          disabled={selectedOpt !== null}
                          className={`font-black text-3xl rounded-2xl p-5 transition-all border-4 ${
                            selectedOpt === null
                              ? "bg-white/90 border-white/50 text-gray-800 hover:scale-105"
                              : opt === currentProblem.answer
                                ? "bg-green-400 border-green-500 text-white scale-105"
                                : opt === selectedOpt
                                  ? "bg-red-400 border-red-500 text-white"
                                  : "bg-white/20 border-white/10 text-white/40"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

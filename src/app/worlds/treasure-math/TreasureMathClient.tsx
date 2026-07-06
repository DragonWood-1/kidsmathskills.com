"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProblems } from "@/lib/mathProblems";
import { recordAnswer } from "@/lib/gameStore";
import RewardPopup from "@/components/rewards/RewardPopup";

const TREASURE_MAP = [
  { id: 1, clue: "🌴 Palm Beach", emoji: "🌴", topic: "addition" as const, treasure: "💎 Ruby", color: "from-cyan-500 to-blue-600" },
  { id: 2, clue: "🏖️ Sandy Shores", emoji: "🏖️", topic: "subtraction" as const, treasure: "💍 Sapphire", color: "from-yellow-500 to-amber-600" },
  { id: 3, clue: "🦜 Parrot Cove", emoji: "🦜", topic: "multiplication" as const, treasure: "🪙 Gold Coins", color: "from-green-500 to-emerald-600" },
  { id: 4, clue: "🌊 Shark Bay", emoji: "🌊", topic: "division" as const, treasure: "💰 Treasure Chest", color: "from-indigo-500 to-purple-600" },
  { id: 5, clue: "⚓ Anchor Isle", emoji: "⚓", topic: "fractions" as const, treasure: "👑 Pirate Crown", color: "from-rose-500 to-red-600" },
];

export default function TreasureMathClient() {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<typeof TREASURE_MAP[0] | null>(null);
  const [problems, setProblems] = useState<ReturnType<typeof getProblems>>([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const ANSWERS_NEEDED = 5;

  function startLocation(loc: typeof TREASURE_MAP[0]) {
    setActive(loc);
    setProblems(getProblems(loc.topic, 1));
    setIndex(0);
    setAnswered(0);
    setCorrect(0);
    setSelectedOpt(null);
    setChestOpen(false);
  }

  function handleAnswer(opt: number) {
    if (selectedOpt !== null || !active) return;
    const isCorrect = opt === problems[index]?.answer;
    setSelectedOpt(opt);
    setLastCorrect(isCorrect);
    setShowReward(true);
    recordAnswer(isCorrect, "treasure-math");
    const newAnswered = answered + 1;
    const newCorrect = correct + (isCorrect ? 1 : 0);
    setAnswered(newAnswered);
    setCorrect(newCorrect);

    if (newCorrect >= ANSWERS_NEEDED) {
      setTimeout(() => {
        setShowReward(false);
        setChestOpen(true);
        setFound(prev => new Set([...prev, active.id]));
      }, 1000);
      return;
    }

    setTimeout(() => {
      setShowReward(false);
      setSelectedOpt(null);
      if (index + 1 >= problems.length) {
        setProblems(getProblems(active.topic, 1));
        setIndex(0);
      } else {
        setIndex(i => i + 1);
      }
    }, 1100);
  }

  const currentProblem = problems[index];

  if (chestOpen && active) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-orange-900 flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1 }}
            className="text-9xl mb-4"
          >
            💰
          </motion.div>
          <h2 className="text-4xl font-black text-yellow-300 mb-2">TREASURE FOUND!</h2>
          <p className="text-white text-xl mb-4">You discovered: {active.treasure}</p>
          <div className="flex gap-2 text-3xl justify-center mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {i < correct ? "⭐" : "☆"}
              </motion.span>
            ))}
          </div>
          <p className="text-yellow-200 mb-6">Correct answers: {correct}/{ANSWERS_NEEDED}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setActive(null)}
              className="flex-1 bg-yellow-400 text-yellow-900 font-black py-4 rounded-2xl hover:bg-yellow-300 transition-colors"
            >
              🗺️ Map
            </button>
            <button
              onClick={() => startLocation(active)}
              className="flex-1 bg-white/20 text-white font-black py-4 rounded-2xl hover:bg-white/30 transition-colors"
            >
              🔄 Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-orange-900 py-8 px-4">
        <RewardPopup show={showReward} correct={lastCorrect} />
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6 text-white">
            <button onClick={() => setActive(null)} className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 font-bold text-sm">← Map</button>
            <div>
              <p className="font-black">{active.emoji} {active.clue}</p>
              <p className="text-yellow-200 text-xs">Solve {ANSWERS_NEEDED} to unlock the treasure!</p>
            </div>
          </div>

          {/* Progress to chest */}
          <div className="bg-white/10 rounded-3xl p-4 mb-6 text-white text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-70">Treasure progress</span>
              <span className="font-black text-yellow-300">{correct}/{ANSWERS_NEEDED} clues solved</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                animate={{ width: `${(correct / ANSWERS_NEEDED) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-center gap-2 mt-3 text-2xl">
              {Array.from({ length: ANSWERS_NEEDED }).map((_, i) => (
                <span key={i}>{i < correct ? "⭐" : "☆"}</span>
              ))}
            </div>
          </div>

          {currentProblem && (
            <div>
              <div className={`bg-gradient-to-br ${active.color} rounded-3xl p-8 text-white text-center mb-6 shadow-xl`}>
                <p className="text-sm opacity-70 mb-2">🗝️ Math Clue {index + 1}</p>
                <p className="text-5xl font-black">{currentProblem.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentProblem.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={selectedOpt !== null}
                    className={`font-black text-3xl rounded-2xl p-5 border-4 transition-all ${
                      selectedOpt === null
                        ? "bg-white border-gray-200 text-gray-800 hover:scale-105 hover:border-yellow-400"
                        : opt === currentProblem.answer
                          ? "bg-green-400 border-green-600 text-white scale-105"
                          : opt === selectedOpt
                            ? "bg-red-400 border-red-600 text-white"
                            : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-orange-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-white mb-10">
          <h1 className="text-5xl font-black mb-3">🏴‍☠️ Treasure Math</h1>
          <p className="text-yellow-200 text-lg">Solve math clues at each location to unlock the hidden treasure!</p>
          <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
            <span className="bg-white/15 rounded-full px-4 py-1">🗺️ 5 Locations</span>
            <span className="bg-white/15 rounded-full px-4 py-1">💰 Treasure Chests</span>
            <span className="bg-white/15 rounded-full px-4 py-1">⭐ Star Ratings</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TREASURE_MAP.map((loc, i) => {
            const isFound = found.has(loc.id);
            return (
              <motion.button
                key={loc.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => startLocation(loc)}
                className={`bg-gradient-to-br ${loc.color} text-white rounded-3xl p-6 text-left shadow-xl relative overflow-hidden`}
              >
                {isFound && (
                  <div className="absolute top-3 right-3 text-2xl">✅</div>
                )}
                <div className="text-5xl mb-3">{loc.emoji}</div>
                <h3 className="font-black text-lg mb-1">{loc.clue}</h3>
                <p className="text-white/70 text-xs mb-3">Treasure: {loc.treasure}</p>
                <div className="text-xs font-bold bg-white/20 rounded-full px-3 py-1 inline-block">
                  {isFound ? "✅ Found! Play Again" : "🗝️ Solve to Unlock"}
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-yellow-200"
        >
          <p>Treasures found: {found.size} / {TREASURE_MAP.length}</p>
          <div className="flex justify-center gap-2 mt-2">
            {TREASURE_MAP.map(loc => (
              <span key={loc.id} className="text-2xl">{found.has(loc.id) ? "💎" : "❔"}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

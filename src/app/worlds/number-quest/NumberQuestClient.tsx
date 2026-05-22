"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameSession from "@/components/game/GameSession";
import Link from "next/link";

const ISLANDS = [
  { id: "counting", name: "Counting Cove", emoji: "🏝️", type: "counting" as const, color: "from-cyan-400 to-blue-500", locked: false, desc: "Count your way across the magic cove!" },
  { id: "addition", name: "Addition Archipelago", emoji: "⛵", type: "addition" as const, color: "from-green-400 to-emerald-500", locked: false, desc: "Add numbers to sail the seas!" },
  { id: "subtraction", name: "Subtraction Shore", emoji: "🪸", type: "subtraction" as const, color: "from-orange-400 to-amber-500", locked: false, desc: "Subtract to reach the treasure shore!" },
  { id: "multiplication", name: "Multiply Mountain", emoji: "🏔️", type: "multiplication" as const, color: "from-purple-500 to-indigo-600", locked: false, desc: "Multiply to climb the magic mountain!" },
  { id: "division", name: "Division Dragon Lair", emoji: "🐉", type: "division" as const, color: "from-red-500 to-rose-600", locked: false, desc: "Face the dragon boss! Divide to survive!" },
  { id: "fractions", name: "Fraction Fortress", emoji: "🏰", type: "fractions" as const, color: "from-violet-500 to-purple-600", locked: false, desc: "Master fractions to unlock the fortress!" },
];

export default function NumberQuestClient() {
  const [selectedIsland, setSelectedIsland] = useState<typeof ISLANDS[0] | null>(null);
  const [completedIslands, setCompletedIslands] = useState<Set<string>>(new Set());

  function handleIslandComplete(islandId: string) {
    setCompletedIslands(prev => new Set([...prev, islandId]));
  }

  if (selectedIsland) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setSelectedIsland(null)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2 font-bold text-sm transition-colors"
            >
              ← Map
            </button>
            <div className="text-white">
              <h1 className="font-black text-xl">{selectedIsland.emoji} {selectedIsland.name}</h1>
              <p className="text-white/70 text-sm">Number Quest World</p>
            </div>
          </div>

          {/* Boss battle header for division */}
          {selectedIsland.id === "division" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/30 border border-red-400 rounded-2xl p-4 mb-6 text-center text-white"
            >
              <p className="text-2xl mb-1">⚔️ BOSS BATTLE!</p>
              <p className="text-sm opacity-80">Defeat the Division Dragon with 8 correct answers!</p>
            </motion.div>
          )}

          <GameSession
            type={selectedIsland.type}
            title={selectedIsland.name}
            emoji={selectedIsland.emoji}
            color={`bg-gradient-to-br ${selectedIsland.color}`}
            world="number-quest"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-3"
          >
            🗺️ Number Quest
          </motion.h1>
          <p className="text-blue-200 text-lg">Travel through 6 magical islands and master math!</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="bg-white/15 rounded-full px-4 py-1">🏝️ 6 Islands</span>
            <span className="bg-white/15 rounded-full px-4 py-1">⚔️ Boss Battles</span>
            <span className="bg-white/15 rounded-full px-4 py-1">🏆 Badges & XP</span>
          </div>
        </div>

        {/* Island map */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ISLANDS.map((island, i) => {
            const completed = completedIslands.has(island.id);
            return (
              <motion.button
                key={island.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedIsland(island)}
                className={`relative bg-gradient-to-br ${island.color} text-white rounded-3xl p-6 text-left shadow-xl cursor-pointer`}
              >
                {completed && (
                  <div className="absolute top-3 right-3 bg-white/30 rounded-full p-1 text-xl">✅</div>
                )}
                <div className="text-4xl mb-3">{island.emoji}</div>
                <h3 className="font-black text-lg mb-1">{island.name}</h3>
                <p className="text-white/80 text-xs mb-3">{island.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="bg-white/25 rounded-full px-3 py-1">
                    {island.id === "division" ? "⚔️ Boss Battle" : "▶ Play Island"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 text-center text-white">
          <p className="text-sm opacity-60">Islands completed: {completedIslands.size} / {ISLANDS.length}</p>
          <div className="flex justify-center gap-2 mt-2">
            {ISLANDS.map(island => (
              <div
                key={island.id}
                className={`w-3 h-3 rounded-full ${completedIslands.has(island.id) ? "bg-yellow-400" : "bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import SpeedDrill from "./SpeedDrill";
import RhythmMode from "./RhythmMode";
import Leaderboard from "./Leaderboard";
import Certificate from "./Certificate";
import { motion } from "framer-motion";
import Link from "next/link";

export type TinyMode = "menu" | "speed" | "rhythm" | "leaderboard" | "certificate";

export interface DrillScore {
  table: number;
  score: number;
  date: string;
}

export function getLeaderboard(): DrillScore[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("kms_tinytables_lb") || "[]");
  } catch {
    return [];
  }
}

export function saveScore(table: number, score: number): void {
  const lb = getLeaderboard();
  lb.push({ table, score, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem("kms_tinytables_lb", JSON.stringify(lb.slice(0, 50)));
}

const MODES = [
  {
    id: "speed" as TinyMode,
    emoji: "⚡",
    title: "Speed Drill",
    desc: "Answer as many as you can in 60 seconds!",
    color: "from-yellow-400 to-orange-500",
    badge: "🏆 High Score",
  },
  {
    id: "rhythm" as TinyMode,
    emoji: "🎵",
    title: "Rhythm Mode",
    desc: "Answer on the beat — stay in the groove!",
    color: "from-pink-500 to-rose-600",
    badge: "🎶 Musical",
  },
  {
    id: "leaderboard" as TinyMode,
    emoji: "🏅",
    title: "Leaderboard",
    desc: "See your top scores for every table",
    color: "from-blue-500 to-indigo-600",
    badge: "📊 Stats",
  },
  {
    id: "certificate" as TinyMode,
    emoji: "🎓",
    title: "Certificate",
    desc: "Print your multiplication mastery certificate!",
    color: "from-green-500 to-emerald-600",
    badge: "🖨️ Printable",
  },
];

export default function TinyTablesClient() {
  const [mode, setMode] = useState<TinyMode>("menu");
  const [selectedTable, setSelectedTable] = useState<number>(2);

  if (mode === "speed") return <SpeedDrill table={selectedTable} onBack={() => setMode("menu")} />;
  if (mode === "rhythm") return <RhythmMode table={selectedTable} onBack={() => setMode("menu")} />;
  if (mode === "leaderboard") return <Leaderboard onBack={() => setMode("menu")} />;
  if (mode === "certificate") return <Certificate table={selectedTable} onBack={() => setMode("menu")} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <h1 className="text-4xl sm:text-6xl font-black mb-2 drop-shadow-lg">⚡ TinyTables</h1>
            <p className="text-base sm:text-xl text-yellow-100">Master your multiplication tables!</p>
          </motion.div>

          {/* Times table selector */}
          <div className="mt-6 bg-white/20 backdrop-blur rounded-3xl p-5 inline-block">
            <p className="font-bold text-sm mb-3 text-yellow-100">Choose your table:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTable(n)}
                  className={`w-10 h-10 rounded-xl font-black text-lg transition-all ${
                    selectedTable === n
                      ? "bg-white text-orange-600 shadow-lg scale-110"
                      : "bg-white/30 text-white hover:bg-white/50"
                  }`}
                >
                  {n}
                </motion.button>
              ))}
            </div>
            <p className="text-yellow-100 text-sm mt-3 font-bold">
              Selected: <span className="text-white">{selectedTable}× tables</span>
            </p>
          </div>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m.id)}
              className={`bg-gradient-to-br ${m.color} text-white rounded-3xl p-5 text-left shadow-xl cursor-pointer`}
            >
              <div className="text-4xl mb-2">{m.emoji}</div>
              <h3 className="font-black text-base mb-1">{m.title}</h3>
              <p className="text-white/80 text-xs mb-3 leading-snug">{m.desc}</p>
              <span className="text-xs bg-white/25 rounded-full px-2 py-0.5 font-bold">{m.badge}</span>
            </motion.button>
          ))}
        </div>

        {/* Quick facts preview for selected table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/15 backdrop-blur rounded-3xl p-6 text-white"
        >
          <h3 className="font-black text-xl mb-4 text-center">
            {selectedTable}× Table Preview
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <div key={n} className="bg-white/20 rounded-xl p-2 text-center text-sm">
                <p className="text-yellow-200 text-xs">{selectedTable}×{n}</p>
                <p className="font-black text-lg">{selectedTable * n}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Nav back */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/70 hover:text-white text-sm font-semibold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

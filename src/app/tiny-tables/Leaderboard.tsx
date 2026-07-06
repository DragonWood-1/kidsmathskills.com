"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLeaderboard, DrillScore } from "./TinyTablesClient";

interface Props {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: Props) {
  const [scores, setScores] = useState<DrillScore[]>([]);
  const [filterTable, setFilterTable] = useState<number | "all">("all");

  useEffect(() => {
    setScores(getLeaderboard());
  }, []);

  function clearScores() {
    if (!confirm("Clear all leaderboard scores?")) return;
    localStorage.removeItem("kms_tinytables_lb");
    setScores([]);
  }

  // Best score per table
  const bestByTable: Record<number, number> = {};
  for (const s of scores) {
    if (!bestByTable[s.table] || s.score > bestByTable[s.table]) {
      bestByTable[s.table] = s.score;
    }
  }

  const filtered = filterTable === "all" ? scores : scores.filter(s => s.table === filterTable);
  const displayed = filtered.slice(0, 20);

  const getMedal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 text-white mb-6">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 font-bold text-sm transition-colors">
            ←
          </button>
          <div>
            <h2 className="text-3xl font-black">🏅 Leaderboard</h2>
            <p className="text-blue-200 text-sm">Your personal high scores</p>
          </div>
        </div>

        {/* Best per table summary */}
        <div className="bg-white/10 rounded-3xl p-5 mb-6">
          <h3 className="text-white font-black mb-3">🏆 Best Per Table</h3>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <div
                key={n}
                className={`rounded-xl p-2 text-center cursor-pointer transition-all ${
                  bestByTable[n] ? "bg-yellow-400 text-yellow-900" : "bg-white/15 text-white/40"
                }`}
                onClick={() => setFilterTable(filterTable === n ? "all" : n)}
              >
                <p className="text-xs font-bold">{n}×</p>
                <p className="text-lg font-black">{bestByTable[n] ?? "–"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterTable("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${filterTable === "all" ? "bg-white text-blue-700" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            All Tables
          </button>
          {Array.from({ length: 12 }, (_, i) => i + 1).filter(n => bestByTable[n]).map(n => (
            <button
              key={n}
              onClick={() => setFilterTable(filterTable === n ? "all" : n)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${filterTable === n ? "bg-white text-blue-700" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              {n}×
            </button>
          ))}
        </div>

        {/* Score list */}
        <div className="space-y-2 mb-6">
          {displayed.length === 0 ? (
            <div className="bg-white/10 rounded-3xl p-10 text-center text-white">
              <p className="text-4xl mb-3">🎯</p>
              <p className="font-bold">No scores yet!</p>
              <p className="text-blue-200 text-sm mt-1">Play Speed Drill to get on the board.</p>
            </div>
          ) : (
            displayed.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/10 rounded-2xl px-5 py-3 flex items-center justify-between text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black w-8">{getMedal(i)}</span>
                  <div>
                    <span className="font-black">{s.table}× table</span>
                    <p className="text-blue-200 text-xs">{s.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-yellow-300">{s.score}</p>
                  <p className="text-xs text-blue-200">correct / 60s</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {scores.length > 0 && (
          <button onClick={clearScores} className="w-full text-blue-300 hover:text-white text-sm py-2 transition-colors">
            🗑️ Clear all scores
          </button>
        )}
      </div>
    </div>
  );
}

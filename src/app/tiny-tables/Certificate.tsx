"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getLeaderboard } from "./TinyTablesClient";

interface Props {
  table: number;
  onBack: () => void;
}

const AVATARS = ["🦸", "🧙", "🦊", "🐉", "🦄", "🤖", "🐸", "🦁", "🐼", "🐯"];

export default function Certificate({ table, onBack }: Props) {
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "Math Hero";
    try { return JSON.parse(localStorage.getItem("kms_player") || "{}").name ?? "Math Hero"; } catch { return "Math Hero"; }
  });
  const [avatar, setAvatar] = useState("🦸");
  const [certTable, setCertTable] = useState(table);

  const lb = getLeaderboard();
  const tableScores = lb.filter(s => s.table === certTable);
  const highScore = tableScores.length > 0 ? tableScores[0].score : 0;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Which tables have been played
  const playedTables = [...new Set(lb.map(s => s.table))].sort((a, b) => a - b);

  function print() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-emerald-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Controls (hidden on print) */}
        <div className="print:hidden flex items-center gap-3 text-white mb-6 flex-wrap">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 font-bold text-sm transition-colors">
            ←
          </button>
          <h2 className="text-3xl font-black">🎓 Certificate</h2>
          <button
            onClick={print}
            className="ml-auto bg-white text-green-700 font-black px-6 py-2 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            🖨️ Print
          </button>
        </div>

        {/* Customizer (hidden on print) */}
        <div className="print:hidden bg-white/10 rounded-3xl p-5 mb-6 text-white">
          <h3 className="font-black mb-4">Customize Your Certificate</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Your name:</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 font-bold border-2 border-white/30 focus:outline-none focus:border-white w-full"
                placeholder="Enter your name"
                maxLength={25}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Choose avatar:</label>
              <div className="flex gap-2 flex-wrap">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`text-2xl p-2 rounded-xl transition-all ${avatar === av ? "bg-white/40 scale-110" : "hover:bg-white/20"}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Which table?</label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setCertTable(n)}
                    className={`w-9 h-9 rounded-xl font-black text-sm transition-all ${certTable === n ? "bg-white text-green-700" : "bg-white/20 text-white hover:bg-white/30"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {playedTables.length > 0 && (
                <p className="text-xs text-green-200 mt-1">
                  Tables with scores: {playedTables.map(t => `${t}×`).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* THE CERTIFICATE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          id="certificate"
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {/* Top decorative banner */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 py-3 text-center">
            <div className="flex justify-center gap-2 text-xl">
              {["⭐","🌟","✨","⭐","🌟","✨","⭐","🌟","✨","⭐"].map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          </div>

          <div className="p-10 text-center">
            {/* Header */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm tracking-widest uppercase font-semibold mb-2">Certificate of Achievement</p>
              <h1 className="text-5xl font-black text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>
                KidsMathSkills
              </h1>
              <p className="text-gray-400 text-sm">⚡ TinyTables Mastery Program</p>
            </div>

            {/* Avatar */}
            <div className="text-7xl mb-4">{avatar}</div>

            {/* This certifies */}
            <p className="text-gray-500 text-lg mb-2">This certifies that</p>
            <h2 className="text-4xl font-black text-purple-700 mb-4 border-b-4 border-purple-200 pb-3 inline-block px-8">
              {name || "Math Hero"}
            </h2>

            <p className="text-gray-600 text-lg mb-2">has demonstrated mastery of the</p>
            <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-5xl rounded-3xl px-8 py-4 mb-4 shadow-xl">
              {certTable}× Times Table
            </div>

            <p className="text-gray-600 text-base mb-1">
              by correctly answering <strong className="text-purple-700">{highScore} problems</strong> in 60 seconds!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 text-4xl my-4">
              {Array.from({ length: highScore >= 20 ? 3 : highScore >= 12 ? 2 : 1 }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
            </div>

            {/* Times table grid */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-center text-sm text-gray-400 mb-3 font-semibold">{certTable}× Multiplication Table</p>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <div key={n} className="text-center bg-white rounded-lg p-1.5 border border-gray-100">
                    <p className="text-xs text-gray-400">{certTable}×{n}</p>
                    <p className="font-black text-gray-800 text-sm">{certTable * n}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & signature line */}
            <div className="flex items-end justify-between border-t-2 border-gray-100 pt-5">
              <div className="text-left">
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-bold text-gray-700 text-sm">{today}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl">🧮</p>
                <p className="text-xs text-gray-400">KidsMathSkills.com</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Signature</p>
                <p className="font-bold text-purple-600 text-sm" style={{ fontFamily: "cursive" }}>
                  Math Master
                </p>
              </div>
            </div>
          </div>

          {/* Bottom decorative banner */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 py-3 text-center">
            <div className="flex justify-center gap-2 text-xl">
              {["⭐","🌟","✨","⭐","🌟","✨","⭐","🌟","✨","⭐"].map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-green-200 text-sm mt-4 print:hidden">
          Click Print to save as PDF or print to paper! 🖨️
        </p>
      </div>
    </div>
  );
}

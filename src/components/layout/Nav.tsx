"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStats } from "@/lib/gameStore";

export default function Nav() {
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stats = getStats();
    setCoins(stats.coins);
    setXp(stats.xp);
    setLevel(stats.level);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight hover:scale-105 transition-transform">
          <span className="text-3xl">🧮</span>
          <span className="hidden sm:block">KidsMathSkills</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-semibold">
          <Link href="/worlds/number-quest" className="hover:text-yellow-300 transition-colors">🗺️ Worlds</Link>
          <Link href="/daily" className="hover:text-yellow-300 transition-colors">🌅 Daily</Link>
          <Link href="/tiny-tables" className="hover:text-yellow-300 transition-colors">⚡ TinyTables</Link>
          <Link href="/classroom" className="hover:text-yellow-300 transition-colors">🏫 Classroom</Link>
          <Link href="/practice/multiplication" className="hover:text-yellow-300 transition-colors">✏️ Practice</Link>
          <Link href="/mathbuddy" className="hover:text-yellow-300 transition-colors">🤖 MathBuddy</Link>
          <Link href="/worksheets" className="hover:text-yellow-300 transition-colors">📄 Worksheets</Link>
          <Link href="/dashboard" className="hover:text-yellow-300 transition-colors">📊 Dashboard</Link>
        </div>

        {/* Player stats */}
        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <span>⭐</span>
            <span>Lv.{level}</span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1">
            <span>🪙</span>
            <span>{coins}</span>
          </div>
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-purple-700 px-4 py-3 flex flex-col gap-3 text-sm font-semibold">
          <Link href="/worlds/number-quest" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">🗺️ Math Worlds</Link>
          <Link href="/daily" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">🌅 Daily Challenge</Link>
          <Link href="/classroom" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">🏫 Classroom Mode</Link>
          <Link href="/tiny-tables" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">⚡ TinyTables</Link>
          <Link href="/practice/multiplication" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">✏️ Practice</Link>
          <Link href="/mathbuddy" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">🤖 MathBuddy AI</Link>
          <Link href="/drawmath" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">🎨 DrawMath</Link>
          <Link href="/worksheets" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">📄 Worksheets</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">📊 Parent Dashboard</Link>
        </div>
      )}
    </nav>
  );
}

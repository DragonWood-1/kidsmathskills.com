"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStats, PlayerStats, BADGE_INFO, AVATARS, levelProgress, xpToNextLevel, saveStats } from "@/lib/gameStore";
import Link from "next/link";

export default function DashboardClient() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    const s = getStats();
    setStats(s);
    setNameInput(s.name);
    setSelectedAvatar(s.avatar);
  }, []);

  function saveName() {
    if (!stats) return;
    const updated = { ...stats, name: nameInput, avatar: selectedAvatar };
    saveStats(updated);
    setStats(updated);
    setEditName(false);
  }

  function resetProgress() {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    localStorage.removeItem("kms_player");
    localStorage.removeItem("kms_zoo");
    localStorage.removeItem("kms_kingdom");
    window.location.reload();
  }

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const xpProgress = Math.round(levelProgress(stats) * 100);
  const toNext = xpToNextLevel(stats);

  const worldEntries = Object.entries(stats.worldProgress);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📊 Progress Dashboard</h1>
          <p className="text-gray-500">Track achievements, stats, and learning progress</p>
        </div>

        {/* Player card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 sm:p-8 mb-6 shadow-xl"
        >
          {editName ? (
            <div className="mb-4">
              <p className="font-bold mb-2">Choose your avatar:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-3xl p-2 rounded-xl transition-all ${selectedAvatar === av ? "bg-white/30 scale-110" : "hover:bg-white/20"}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="flex-1 bg-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 font-bold border-2 border-white/30 focus:outline-none focus:border-white"
                  placeholder="Your name"
                  maxLength={20}
                />
                <button onClick={saveName} className="bg-yellow-400 text-yellow-900 font-black px-5 py-2 rounded-xl hover:bg-yellow-300 transition-colors">Save</button>
                <button onClick={() => setEditName(false)} className="bg-white/20 font-bold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="text-5xl sm:text-6xl">{stats.avatar}</div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">{stats.name}</h2>
                  <p className="text-white/70">Level {stats.level} Math Hero</p>
                </div>
              </div>
              <button onClick={() => setEditName(true)} className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-bold transition-colors">
                ✏️ Edit
              </button>
            </div>
          )}

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Level {stats.level}</span>
              <span>{toNext} XP to Level {stats.level + 1}</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              />
            </div>
            <p className="text-right text-sm mt-1 opacity-70">{stats.xp} total XP</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-lg sm:text-2xl font-black text-yellow-300">🪙 {stats.coins}</p>
              <p className="text-xs opacity-70">Coins</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-lg sm:text-2xl font-black text-orange-300">🔥 {stats.streak}</p>
              <p className="text-xs opacity-70">Streak</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-lg sm:text-2xl font-black text-green-300">✅ {stats.totalCorrect}</p>
              <p className="text-xs opacity-70">Correct</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-lg sm:text-2xl font-black text-blue-300">📊 {accuracy}%</p>
              <p className="text-xs opacity-70">Accuracy</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-black text-gray-900 text-xl mb-4">🏅 Badges ({stats.badges.length})</h3>
            {stats.badges.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-sm">Start playing to earn your first badge!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stats.badges.map(badgeId => {
                  const info = BADGE_INFO[badgeId] ?? { emoji: "🏅", label: badgeId };
                  return (
                    <div key={badgeId} className="flex items-center gap-3 bg-yellow-50 rounded-2xl p-3 border border-yellow-200">
                      <span className="text-3xl">{info.emoji}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{info.label}</p>
                        <p className="text-xs text-gray-500">Earned!</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 text-xs text-gray-400">
              <p>How to earn more badges:</p>
              <ul className="list-disc ml-4 mt-1 space-y-0.5">
                <li>Keep a 10-question streak</li>
                <li>Answer 100 correctly</li>
                <li>Reach Level 5</li>
                <li>Collect 500 coins</li>
              </ul>
            </div>
          </motion.div>

          {/* World progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-black text-gray-900 text-xl mb-4">🌍 World Progress</h3>
            {worldEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🗺️</p>
                <p className="text-sm">Visit a math world to start tracking progress!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {worldEntries.map(([world, count]) => (
                  <div key={world}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold capitalize text-gray-700">{world.replace("-", " ")}</span>
                      <span className="text-purple-600 font-bold">{count} correct</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min((count / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats detail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-black text-gray-900 text-xl mb-4">📈 Learning Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm">Total Problems Attempted</span>
                <span className="font-black text-gray-900">{stats.totalAnswered}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm">Total Correct</span>
                <span className="font-black text-green-600">{stats.totalCorrect}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm">Overall Accuracy</span>
                <span className={`font-black ${accuracy >= 80 ? "text-green-600" : accuracy >= 60 ? "text-yellow-600" : "text-red-600"}`}>{accuracy}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600 text-sm">Current Streak</span>
                <span className="font-black text-orange-500">🔥 {stats.streak}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm">Total XP Earned</span>
                <span className="font-black text-purple-600">⭐ {stats.xp}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-black text-gray-900 text-xl mb-4">🚀 Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: "/worlds/number-quest", emoji: "🗺️", label: "Number Quest" },
                { href: "/worlds/math-zoo", emoji: "🦁", label: "Math Zoo" },
                { href: "/worlds/rocket-math", emoji: "🚀", label: "Rocket Math" },
                { href: "/worlds/math-kingdom", emoji: "🏰", label: "Math Kingdom" },
                { href: "/worksheets", emoji: "📄", label: "Print Worksheets" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors text-sm font-semibold text-gray-700 hover:text-purple-700"
                >
                  <span className="text-xl">{link.emoji}</span>
                  <span>{link.label}</span>
                  <span className="ml-auto text-gray-300">→</span>
                </Link>
              ))}
            </div>

            <button
              onClick={resetProgress}
              className="mt-4 w-full text-xs text-red-400 hover:text-red-600 transition-colors py-2"
            >
              ⚠️ Reset all progress
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const worlds = [
  {
    href: "/worlds/number-quest",
    emoji: "🗺️",
    title: "Number Quest",
    desc: "Travel through magical islands, unlock math powers, and defeat boss battles!",
    bg: "from-orange-400 to-rose-500",
    tag: "Adventure",
    grade: "K–3",
  },
  {
    href: "/worlds/math-zoo",
    emoji: "🦁",
    title: "Math Zoo",
    desc: "Feed magical animals with correct answers. Collect and evolve 50+ creatures!",
    bg: "from-green-400 to-teal-500",
    tag: "Collection",
    grade: "K–2",
  },
  {
    href: "/worlds/rocket-math",
    emoji: "🚀",
    title: "Rocket Math Academy",
    desc: "Blast through space missions! Race against friends in multiplayer math battles.",
    bg: "from-blue-500 to-indigo-600",
    tag: "Speed",
    grade: "2–5",
  },
  {
    href: "/worlds/math-kingdom",
    emoji: "🏰",
    title: "Math Kingdom",
    desc: "Build your castle kingdom! Every correct answer earns bricks and resources.",
    bg: "from-purple-500 to-violet-600",
    tag: "Builder",
    grade: "2–6",
  },
  {
    href: "/worlds/treasure-math",
    emoji: "🏴‍☠️",
    title: "Treasure Math",
    desc: "Solve math clues to find hidden treasure! Perfect for mental math mastery.",
    bg: "from-yellow-500 to-orange-500",
    tag: "Mystery",
    grade: "1–4",
  },
  {
    href: "/tiny-tables",
    emoji: "⚡",
    title: "TinyTables",
    desc: "Master times tables with speed drills, rhythm mode, leaderboards, and certificates!",
    bg: "from-yellow-400 to-orange-500",
    tag: "Mastery",
    grade: "2–5",
  },
];

export default function WorldsGrid() {
  return (
    <section className="py-16 px-4 bg-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Choose Your World! 🌍</h2>
          <p className="text-gray-600 text-lg">6 epic math worlds + AI tutor, each with unique adventures and rewards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((world, i) => (
            <motion.div
              key={world.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={world.href} className="block world-card">
                <div className={`bg-gradient-to-br ${world.bg} p-8 text-white h-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{world.emoji}</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-white/25 text-xs font-bold px-2 py-1 rounded-full">{world.tag}</span>
                      <span className="bg-white/25 text-xs font-bold px-2 py-1 rounded-full">Grade {world.grade}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2">{world.title}</h3>
                  <p className="text-white/85 text-sm leading-relaxed mb-4">{world.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span>Play Now</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Bonus card — Quick Practice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="world-card"
          >
            <Link href="/practice/multiplication" className="block h-full">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-white h-full flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-4">⚡</span>
                <h3 className="text-2xl font-black mb-2">Quick Practice</h3>
                <p className="text-white/85 text-sm mb-4">Jump straight into timed drills. Great for building speed and fluency!</p>
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-bold">All grades →</div>
              </div>
            </Link>
          </motion.div>

          {/* MathBuddy AI card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="world-card"
          >
            <Link href="/mathbuddy" className="block h-full">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white h-full flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-4">🤖</span>
                <h3 className="text-2xl font-black mb-2">MathBuddy AI</h3>
                <p className="text-white/85 text-sm mb-4">Stuck on a problem? Ask MathBuddy! Get gentle, friendly explanations anytime.</p>
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-bold">Chat now →</div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

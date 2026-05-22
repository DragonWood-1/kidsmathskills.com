"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const floatingEmojis = [
  { emoji: "⭐", x: "10%", y: "20%", delay: 0 },
  { emoji: "🌙", x: "85%", y: "15%", delay: 0.5 },
  { emoji: "🎯", x: "75%", y: "70%", delay: 1 },
  { emoji: "💫", x: "15%", y: "75%", delay: 1.5 },
  { emoji: "🎪", x: "50%", y: "10%", delay: 2 },
  { emoji: "🦄", x: "5%", y: "50%", delay: 0.8 },
  { emoji: "🏆", x: "90%", y: "45%", delay: 1.2 },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white py-24 px-4">
      {/* Floating decorations */}
      {floatingEmojis.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl opacity-30 select-none pointer-events-none hidden md:block"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-semibold mb-6">
            <span>🔥</span>
            <span>10,000+ kids learning math every day!</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Math is an
            <span className="block text-yellow-300 drop-shadow-lg">Adventure! 🚀</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Travel through magical worlds, earn rewards, and master math —
            all while having the time of your life!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/worlds/number-quest"
                className="inline-block bg-yellow-400 text-yellow-900 font-black text-xl px-10 py-5 rounded-2xl shadow-lg hover:bg-yellow-300 transition-colors"
              >
                🗺️ Start Your Quest!
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/practice/multiplication"
                className="inline-block bg-white/20 backdrop-blur text-white font-black text-xl px-10 py-5 rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-colors"
              >
                ✏️ Quick Practice
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "5", label: "Math Worlds" },
              { value: "1,000+", label: "Problems" },
              { value: "K–6", label: "Grade Levels" },
              { value: "100%", label: "Free to Play" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/15 rounded-2xl px-6 py-3"
              >
                <p className="text-3xl font-black text-yellow-300">{stat.value}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L480 20L960 50L1440 10V60H0Z" fill="rgb(250 245 255)" />
        </svg>
      </div>
    </section>
  );
}

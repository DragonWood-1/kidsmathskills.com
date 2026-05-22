"use client";

import { motion } from "framer-motion";

const features = [
  { emoji: "🤖", title: "AI-Adaptive Difficulty", desc: "Problems get harder or easier based on your performance. Always perfectly challenging!" },
  { emoji: "🏆", title: "Rewards & Badges", desc: "Earn coins, XP, and unlock rare badges. Build your collection of achievements!" },
  { emoji: "🔥", title: "Streak Tracking", desc: "Keep your daily streak alive! Bonus coins for answering 5 in a row correctly." },
  { emoji: "📱", title: "Works Everywhere", desc: "Play on phone, tablet, or computer. Progress saves automatically to your profile." },
  { emoji: "💡", title: "Smart Hints", desc: "Stuck? Get a friendly hint that teaches the concept, not just the answer." },
  { emoji: "📊", title: "Parent Dashboard", desc: "Parents and teachers can track progress, set goals, and print custom worksheets." },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Why Kids Love It 💜</h2>
          <p className="text-gray-600 text-lg">Built like a game, designed like a school — the best of both worlds</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100"
            >
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const steps = [
  { emoji: "🎮", title: "Pick a World", desc: "Choose from 5 epic math adventure worlds, each with unique themes and challenges." },
  { emoji: "🧠", title: "Solve Problems", desc: "Answer math questions adapted to your level. Hints available if you get stuck!" },
  { emoji: "⭐", title: "Earn Rewards", desc: "Collect XP, coins, badges, and unlock new abilities as you learn." },
  { emoji: "📈", title: "Level Up!", desc: "The game gets harder as you improve — always the perfect challenge." },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">How It Works ✨</h2>
          <p className="text-gray-600 text-lg">Learning math has never been this fun!</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm">
                {step.emoji}
              </div>
              <div className="bg-purple-600 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center mx-auto mb-2">
                {i + 1}
              </div>
              <h3 className="font-black text-gray-900 mb-1">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

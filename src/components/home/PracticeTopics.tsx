"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const topics = [
  { href: "/practice/addition", emoji: "➕", title: "Addition", desc: "From single digits to multi-digit", color: "bg-blue-500" },
  { href: "/practice/multiplication", emoji: "✖️", title: "Multiplication", desc: "Times tables mastery", color: "bg-purple-500" },
  { href: "/practice/fractions", emoji: "½", title: "Fractions", desc: "Visual fraction learning", color: "bg-pink-500" },
  { href: "/practice/counting", emoji: "🔢", title: "Counting", desc: "Number patterns & sequences", color: "bg-green-500" },
  { href: "/worksheets", emoji: "📄", title: "Worksheets", desc: "Printable practice sheets", color: "bg-orange-500" },
  { href: "/dashboard", emoji: "📊", title: "Dashboard", desc: "Track your progress", color: "bg-indigo-500" },
];

export default function PracticeTopics() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Practice Topics 📚</h2>
          <p className="text-gray-600 text-lg">Targeted practice for every math skill</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map((t, i) => (
            <motion.div
              key={t.href}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={t.href}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
              >
                <div className={`${t.color} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {t.emoji}
                </div>
                <div>
                  <p className="font-black text-gray-900">{t.title}</p>
                  <p className="text-gray-500 text-xs">{t.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GameSession from "./GameSession";
import { PracticeType } from "@/lib/mathProblems";

interface PracticeClientProps {
  type: PracticeType;
  title: string;
  emoji: string;
  color: string;
  description: string;
  seoContent: { h2: string; body: string };
}

export default function PracticeClient({ type, title, emoji, color, description, seoContent }: PracticeClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${color} rounded-3xl p-6 text-white mb-8 shadow-xl`}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{emoji}</span>
            <div>
              <h1 className="text-3xl font-black">{title} Practice</h1>
              <p className="text-white/80 text-sm mt-1">{description}</p>
            </div>
          </div>
        </motion.div>

        {/* Game */}
        <GameSession
          type={type}
          title={title}
          emoji={emoji}
          color={color}
        />

        {/* Related topics */}
        <div className="mt-12 bg-gray-50 rounded-3xl p-6">
          <h3 className="font-black text-gray-900 text-lg mb-4">More Practice Topics</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/practice/addition", emoji: "➕", label: "Addition" },
              { href: "/practice/multiplication", emoji: "✖️", label: "Multiplication" },
              { href: "/practice/fractions", emoji: "½", label: "Fractions" },
              { href: "/practice/counting", emoji: "🔢", label: "Counting" },
            ].filter(t => !t.href.includes(type)).slice(0, 4).map(t => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2 bg-white rounded-xl p-3 border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all font-semibold text-gray-700 text-sm"
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* SEO content */}
        <div className="mt-8 prose prose-gray max-w-none">
          <h2 className="text-2xl font-black text-gray-900 mb-3">{seoContent.h2}</h2>
          <p className="text-gray-600 leading-relaxed">{seoContent.body}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getProblems, PracticeType } from "@/lib/mathProblems";

const WORKSHEET_TYPES = [
  { type: "addition" as PracticeType, label: "Addition", emoji: "➕", grade: "K–3", color: "bg-blue-500", seoTitle: "2-Digit Addition Worksheets" },
  { type: "subtraction" as PracticeType, label: "Subtraction", emoji: "➖", grade: "K–3", color: "bg-cyan-500", seoTitle: "Subtraction Practice Sheets" },
  { type: "multiplication" as PracticeType, label: "Multiplication", emoji: "✖️", grade: "3–5", color: "bg-purple-500", seoTitle: "Multiplication Tables Worksheets" },
  { type: "division" as PracticeType, label: "Division", emoji: "÷", grade: "3–5", color: "bg-indigo-500", seoTitle: "Division Practice Worksheets" },
  { type: "fractions" as PracticeType, label: "Fractions", emoji: "½", grade: "3–5", color: "bg-pink-500", seoTitle: "Fractions for Kids Worksheets" },
  { type: "counting" as PracticeType, label: "Counting", emoji: "🔢", grade: "K–2", color: "bg-green-500", seoTitle: "Counting & Number Patterns" },
  { type: "money" as PracticeType, label: "Counting Money", emoji: "🪙", grade: "1–3", color: "bg-yellow-500", seoTitle: "Counting Money Worksheets" },
  { type: "time" as PracticeType, label: "Telling Time", emoji: "🕐", grade: "1–3", color: "bg-orange-500", seoTitle: "Telling Time Worksheets" },
];

export default function WorksheetsClient() {
  const [selected, setSelected] = useState<typeof WORKSHEET_TYPES[0] | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [problems, setProblems] = useState<ReturnType<typeof getProblems>>([]);
  const [generated, setGenerated] = useState(false);

  function generate(type: typeof WORKSHEET_TYPES[0], diff: number) {
    const p = getProblems(type.type, diff);
    setSelected(type);
    setDifficulty(diff);
    setProblems(p);
    setGenerated(true);
  }

  function printWorksheet() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-3">📄 Free Math Worksheets</h1>
          <p className="text-gray-600 text-lg">Generate printable worksheets for any topic and grade level — completely free!</p>
        </div>

        {!generated ? (
          <>
            {/* Topic grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {WORKSHEET_TYPES.map((t, i) => (
                <motion.button
                  key={t.type}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => generate(t, 1)}
                  className="bg-white border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 rounded-2xl p-5 text-left transition-all group"
                >
                  <div className={`${t.color} text-white text-2xl w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    {t.emoji}
                  </div>
                  <p className="font-black text-gray-900 text-sm">{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Grade {t.grade}</p>
                </motion.button>
              ))}
            </div>

            {/* SEO content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-900 text-xl mb-3">📝 About Our Worksheets</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Our free printable math worksheets are generated fresh each time — so every worksheet is unique!
                  Great for homework, classroom practice, or extra study. Cover topics from basic counting all the way through fractions and division.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-900 text-xl mb-3">🎓 For Teachers & Parents</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Aligned with K–6 math standards, these worksheets are perfect for extra practice, morning work,
                  or take-home assignments. Choose from 3 difficulty levels and print as many as you need — always free!
                </p>
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setGenerated(false)} className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 font-bold text-sm transition-colors">
                  ← Back
                </button>
                <div>
                  <h2 className="font-black text-xl text-gray-900">{selected?.emoji} {selected?.seoTitle}</h2>
                  <p className="text-gray-500 text-sm">Grade {selected?.grade} • Level {difficulty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1">
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      onClick={() => selected && generate(selected, d)}
                      className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${difficulty === d ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      Level {d}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => selected && generate(selected, difficulty)}
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl px-4 py-2 font-bold text-sm transition-colors"
                >
                  🔄 New Set
                </button>
                <button
                  onClick={printWorksheet}
                  className="bg-purple-600 text-white hover:bg-purple-700 rounded-xl px-4 py-2 font-bold text-sm transition-colors"
                >
                  🖨️ Print PDF
                </button>
              </div>
            </div>

            {/* Worksheet */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 print:shadow-none">
              <div className="print-header text-center border-b-2 border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-black text-gray-900">{selected?.seoTitle}</h2>
                <p className="text-gray-500 text-sm mt-1">Name: ___________________________ Date: _______________ Score: ___/10</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {problems.map((p, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Problem {i + 1}</p>
                    <p className="text-2xl font-black text-gray-900 mb-3">{p.question}</p>
                    <div className="border-b-2 border-gray-300 h-8"></div>
                  </div>
                ))}
              </div>

              {/* Answer key (hidden on print) */}
              <details className="mt-8 print:hidden">
                <summary className="cursor-pointer font-bold text-purple-600 hover:text-purple-800">🔑 Answer Key (click to show)</summary>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {problems.map((p, i) => (
                    <div key={i} className="bg-green-50 rounded-lg p-2 text-center text-sm">
                      <p className="text-gray-500">{i + 1}.</p>
                      <p className="font-black text-green-700">{p.answer}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

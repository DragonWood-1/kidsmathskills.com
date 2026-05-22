"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Problem } from "@/lib/mathProblems";

interface MathProblemProps {
  problem: Problem;
  onAnswer: (correct: boolean) => void;
  showHint?: boolean;
}

export default function MathProblem({ problem, onAnswer, showHint = true }: MathProblemProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    setSelected(null);
    setHintVisible(false);
  }, [problem]);

  function handleSelect(opt: number) {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === problem.answer;
    setTimeout(() => onAnswer(correct), 800);
  }

  function getOptionStyle(opt: number) {
    if (selected === null) return "bg-white border-gray-200 text-gray-800 hover:border-purple-400 hover:bg-purple-50 hover:scale-105";
    if (opt === problem.answer) return "bg-green-400 border-green-600 text-white scale-105";
    if (opt === selected) return "bg-red-400 border-red-600 text-white";
    return "bg-gray-100 border-gray-200 text-gray-400";
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Question */}
      <motion.div
        key={problem.question}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-5 sm:p-8 text-center mb-4 sm:mb-6 shadow-xl"
      >
        <p className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">{problem.question}</p>
      </motion.div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {problem.options.map((opt) => (
          <motion.button
            key={opt}
            whileHover={selected === null ? { scale: 1.03 } : {}}
            whileTap={selected === null ? { scale: 0.97 } : {}}
            onClick={() => handleSelect(opt)}
            className={`relative font-black text-xl sm:text-3xl rounded-2xl p-3 sm:p-5 text-center cursor-pointer transition-all duration-200 border-4 ${getOptionStyle(opt)}`}
          >
            {opt}
            {selected !== null && opt === problem.answer && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 text-2xl"
              >
                ✅
              </motion.span>
            )}
            {selected === opt && opt !== problem.answer && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 text-2xl"
              >
                ❌
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Hint */}
      {showHint && problem.hint && (
        <div className="text-center">
          {!hintVisible ? (
            <button
              onClick={() => setHintVisible(true)}
              className="text-sm text-purple-500 hover:text-purple-700 font-semibold underline"
            >
              💡 Need a hint?
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 text-yellow-800 text-sm font-semibold"
            >
              💡 {problem.hint}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

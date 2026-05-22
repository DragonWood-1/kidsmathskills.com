"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "Give me a problem!", emoji: "🎯", text: "Give me a fun math problem to practice!" },
  { label: "I need help", emoji: "🆘", text: "I need help understanding something. Can you explain it step by step?" },
  { label: "Times tables", emoji: "✖️", text: "Can you help me practice my multiplication times tables?" },
  { label: "Fractions help", emoji: "½", text: "Fractions confuse me. Can you explain them in a simple way?" },
  { label: "Word problem", emoji: "📖", text: "Give me a fun word problem to solve!" },
  { label: "Check my work", emoji: "✅", text: "I want to show you my math work and check if it's right." },
];

const BUDDY_MOODS = {
  idle: "😊",
  thinking: "🤔",
  happy: "🥳",
  encouraging: "💪",
};

const GRADE_LABELS: Record<number, string> = {
  0: "Kindergarten",
  1: "Grade 1",
  2: "Grade 2",
  3: "Grade 3",
  4: "Grade 4",
  5: "Grade 5",
  6: "Grade 6",
};

export default function MathBuddyClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [grade, setGrade] = useState(3);
  const [buddyMood, setBuddyMood] = useState<keyof typeof BUDDY_MOODS>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi there! I'm MathBuddy, your math helper! 🧮✨\n\nI'm here to make math fun and easy. You can ask me anything — from counting to fractions to big multiplication problems!\n\nWhat would you like to work on today? 🌟",
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/[*#_`~]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // prefer a friendly child-like voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("google us english")
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);
    setBuddyMood("thinking");

    // Add empty assistant message to stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/mathbuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          grade,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fullText };
          return updated;
        });
      }

      setBuddyMood(fullText.includes("🎉") || fullText.includes("Amazing") ? "happy" : "encouraging");
      setTimeout(() => setBuddyMood("idle"), 3000);

      // Auto-speak short responses
      if (fullText.length < 400) {
        speak(fullText);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Oops! I had a little hiccup. Can you try asking again? 😊",
          };
          return updated;
        });
        setBuddyMood("idle");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/80 hover:text-white text-sm font-semibold transition-colors">
              ← Home
            </Link>
            <div className="w-px h-5 bg-white/30" />
            <motion.div
              animate={{ scale: buddyMood === "happy" ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.4 }}
              className="text-4xl"
            >
              {BUDDY_MOODS[buddyMood]}
            </motion.div>
            <div>
              <h1 className="font-black text-xl leading-none">MathBuddy</h1>
              <p className="text-blue-200 text-xs">Your friendly math tutor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Grade selector */}
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="bg-white/20 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-white/30 focus:outline-none"
            >
              {Object.entries(GRADE_LABELS).map(([g, label]) => (
                <option key={g} value={g} className="text-gray-900">
                  {label}
                </option>
              ))}
            </select>

            {/* TTS toggle */}
            <button
              onClick={isSpeaking ? stopSpeaking : undefined}
              title={isSpeaking ? "Stop speaking" : "Responses will be read aloud"}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                isSpeaking ? "bg-yellow-400 text-yellow-900 animate-pulse" : "bg-white/20 text-white"
              }`}
            >
              {isSpeaking ? "🔊 Speaking..." : "🔈 Read Aloud"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Quick prompts */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-gray-500 text-sm font-semibold mb-3 text-center">Quick starts:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.text)}
                  className="bg-white rounded-2xl px-4 py-3 text-left hover:bg-blue-50 hover:shadow-md transition-all border border-gray-100 group"
                >
                  <span className="text-2xl block mb-1">{qp.emoji}</span>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">{qp.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <div className="flex-1 space-y-4 mb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl flex-shrink-0 mt-1 shadow-md">
                    🧮
                  </div>
                )}

                <div
                  className={`rounded-3xl px-5 py-3 max-w-[80%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                  }`}
                >
                  {msg.role === "assistant" && msg.content === "" && isStreaming ? (
                    <div className="flex gap-1 items-center py-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, delay: dot * 0.15, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-blue-400"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                  )}

                  {/* Speak button for assistant messages */}
                  {msg.role === "assistant" && msg.content && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="mt-2 text-xs text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1"
                    >
                      🔊 Read aloud
                    </button>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-xl flex-shrink-0 mt-1 shadow-md">
                    ⭐
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-3 sticky bottom-4">
          {/* Quick prompt chips when chatting */}
          {messages.length > 1 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_PROMPTS.slice(0, 4).map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.text)}
                  disabled={isStreaming}
                  className="flex-shrink-0 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {qp.emoji} {qp.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MathBuddy anything..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors disabled:opacity-60"
              style={{ maxHeight: "120px", overflowY: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-black text-xl hover:opacity-90 disabled:opacity-40 transition-opacity shadow-md flex-shrink-0"
            >
              {isStreaming ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
              ) : (
                "→"
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

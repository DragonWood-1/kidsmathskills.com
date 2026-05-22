"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { RoomSnapshot, PublicPlayer, ClassroomProblem } from "@/lib/classroomStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATARS = ["🦊", "🐉", "🦄", "🐼", "🦁", "🐯", "🐸", "🤖", "🦸", "🧙", "🐧", "🦋"];

type Phase = "home" | "teacher-setup" | "student-setup" | "lobby" | "playing" | "results";

interface Session {
  code: string;
  playerId: string;
  isTeacher: boolean;
  name: string;
  avatar: string;
}

interface AnswerState {
  selected: number | null;
  correct: boolean | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMedal(rank: number) {
  return rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}.`;
}

function sortedPlayers(players: PublicPlayer[]) {
  return [...players].sort((a, b) => b.score - a.score || a.currentQuestion - b.currentQuestion);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ClassroomClient() {
  const [phase, setPhase] = useState<Phase>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [localQ, setLocalQ] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({ selected: null, correct: null });
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // setup form
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🦊");
  const [joinCode, setJoinCode] = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Polling ────────────────────────────────────────────────────────────────
  const poll = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/classroom/${code}`);
      if (!res.ok) return;
      const data: RoomSnapshot = await res.json();
      setRoom(data);
      if (data.phase === "playing") setPhase((p) => p === "lobby" ? "playing" : p);
      if (data.phase === "ended") setPhase("results");
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!session || phase === "home" || phase === "teacher-setup" || phase === "student-setup") return;
    const interval = phase === "playing" ? 1800 : 3000;
    pollRef.current = setInterval(() => poll(session.code), interval);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session, phase, poll]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  async function createRoom() {
    if (!name.trim()) { setError("Enter your name first!"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: name.trim(), avatar }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      const sess: Session = { code: data.code, playerId: data.playerId, isTeacher: true, name: name.trim(), avatar };
      setSession(sess);
      setRoom(data.snapshot);
      setPhase("lobby");
    } catch { setError("Connection error. Try again."); }
    finally { setLoading(false); }
  }

  async function joinRoom() {
    if (!name.trim()) { setError("Enter your name first!"); return; }
    if (joinCode.length !== 6) { setError("Enter the 6-letter code from your teacher."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", name: name.trim(), avatar, code: joinCode.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      const sess: Session = { code: joinCode.toUpperCase(), playerId: data.playerId, isTeacher: false, name: name.trim(), avatar };
      setSession(sess);
      setRoom(data.snapshot);
      setPhase(data.snapshot.phase === "playing" ? "playing" : "lobby");
    } catch { setError("Connection error. Try again."); }
    finally { setLoading(false); }
  }

  async function startGame() {
    if (!session) return;
    const res = await fetch(`/api/classroom/${session.code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", playerId: session.playerId }),
    });
    const data = await res.json();
    setRoom(data);
    if (data.phase === "playing") setPhase("playing");
  }

  async function endGame() {
    if (!session) return;
    await fetch(`/api/classroom/${session.code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", playerId: session.playerId }),
    });
    setPhase("results");
  }

  async function submitAnswer(value: number) {
    if (answerState.selected !== null || !session || !room) return;
    const problem: ClassroomProblem = room.problems[localQ];
    if (!problem) return;

    setAnswerState({ selected: value, correct: null });
    try {
      const res = await fetch(`/api/classroom/${session.code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", playerId: session.playerId, questionIndex: localQ, value }),
      });
      const data = await res.json();
      setAnswerState({ selected: value, correct: data.correct });
      if (data.snapshot) setRoom(data.snapshot);
      if (data.snapshot?.phase === "ended") { setPhase("results"); return; }

      setTimeout(() => {
        setAnswerState({ selected: null, correct: null });
        setShowHint(false);
        if (localQ + 1 >= (room.questionCount || 10)) {
          setPhase("results");
        } else {
          setLocalQ((q) => q + 1);
        }
      }, 1000);
    } catch {
      setAnswerState({ selected: null, correct: null });
    }
  }

  // ─── Renders ──────────────────────────────────────────────────────────────
  const studentCount = room ? room.players.filter((p) => !p.isTeacher).length : 0;
  const sorted = room ? sortedPlayers(room.players) : [];
  const myPlayer = room && session ? room.players.find((p) => p.id === session.playerId) : null;
  const myRank = myPlayer ? sorted.findIndex((p) => p.id === myPlayer.id) : -1;

  function SetupForm({ isTeacher }: { isTeacher: boolean }) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => { setPhase("home"); setError(""); }} className="text-sm font-semibold text-white/80 hover:text-white mb-6 flex items-center gap-1">← Back</button>
        <h2 className="text-2xl font-black text-white mb-6">
          {isTeacher ? "👩‍🏫 Set Up Your Classroom" : "🧒 Join the Game"}
        </h2>
        <div className="bg-white rounded-3xl p-6 space-y-5">
          <div>
            <label className="text-sm font-black text-gray-600 block mb-1">Your name</label>
            <input
              autoFocus value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (isTeacher ? createRoom() : joinRoom())}
              maxLength={20} placeholder={isTeacher ? "Ms. Smith" : "Your name"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-indigo-400"
            />
          </div>

          {!isTeacher && (
            <div>
              <label className="text-sm font-black text-gray-600 block mb-1">Room code (from teacher)</label>
              <input
                value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                placeholder="ABC123"
                className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3 text-3xl font-black tracking-widest text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-black text-gray-600 block mb-2">Pick your avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button key={av} onClick={() => setAvatar(av)}
                  className={`text-3xl p-2 rounded-xl transition-all ${avatar === av ? "bg-indigo-100 scale-110 ring-2 ring-indigo-400" : "hover:bg-gray-50"}`}>
                  {av}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

          <button
            onClick={isTeacher ? createRoom : joinRoom}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
          >
            {loading ? "Connecting..." : isTeacher ? "Create Classroom →" : "Join Game →"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Leaderboard strip ────────────────────────────────────────────────────
  function Leaderboard({ compact = false }: { compact?: boolean }) {
    const shown = compact ? sorted.slice(0, 5) : sorted;
    return (
      <div className="space-y-2">
        <AnimatePresence>
          {shown.map((p, i) => {
            const isMe = p.id === session?.playerId;
            const pct = room ? Math.round((p.currentQuestion / room.questionCount) * 100) : 0;
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${isMe ? "bg-yellow-100 ring-2 ring-yellow-400" : "bg-white"}`}
              >
                <span className="text-xl font-black w-8 text-center">{getMedal(i)}</span>
                <span className="text-2xl">{p.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-800 truncate">{p.name}{p.isTeacher ? " 👩‍🏫" : ""}</span>
                    {p.finished && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Done!</span>}
                  </div>
                  {!compact && (
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-indigo-400 rounded-full" animate={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <span className="font-black text-2xl text-indigo-700">{p.score}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Phase views ──────────────────────────────────────────────────────────
  if (phase === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
          <Link href="/" className="text-white/70 hover:text-white text-sm font-semibold mb-8 inline-block">← KidsMathSkills</Link>
          <div className="text-7xl mb-4">🏫</div>
          <h1 className="text-4xl font-black text-white mb-2">Classroom Mode</h1>
          <p className="text-indigo-200 mb-8">Live math battles! Everyone plays the same problems in real time.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => { setPhase("teacher-setup"); setError(""); }}
              className="bg-white rounded-3xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-3">👩‍🏫</div>
              <p className="font-black text-gray-800 text-lg">I&apos;m a Teacher</p>
              <p className="text-gray-500 text-sm mt-1">Create a room &amp; share the code</p>
            </button>
            <button onClick={() => { setPhase("student-setup"); setError(""); }}
              className="bg-white rounded-3xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-3">🧒</div>
              <p className="font-black text-gray-800 text-lg">I&apos;m a Student</p>
              <p className="text-gray-500 text-sm mt-1">Enter the code to join</p>
            </button>
          </div>
          <p className="text-indigo-300 text-xs">Requires a persistent server. <a href="https://fly.io" className="underline">fly.io</a> or <code className="bg-indigo-800 px-1 rounded">npm run dev</code> on a local machine both work.</p>
        </motion.div>
      </div>
    );
  }

  if (phase === "teacher-setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 px-4 py-12">
        <div className="max-w-md mx-auto"><SetupForm isTeacher /></div>
      </div>
    );
  }

  if (phase === "student-setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 px-4 py-12">
        <div className="max-w-md mx-auto"><SetupForm isTeacher={false} /></div>
      </div>
    );
  }

  if (phase === "lobby" && session && room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 px-4 py-8">
        <div className="max-w-xl mx-auto">
          {session.isTeacher ? (
            <>
              {/* Teacher lobby — projector-friendly code display */}
              <div className="text-center mb-8">
                <p className="text-indigo-200 font-semibold mb-2">Share this code with your class:</p>
                <div className="bg-white rounded-3xl py-6 px-8 inline-block shadow-2xl">
                  <p className="text-5xl sm:text-7xl font-black tracking-widest text-indigo-700 select-all break-all">{session.code}</p>
                </div>
                <p className="text-indigo-300 text-sm mt-3">Students go to <span className="font-bold text-white">KidsMathSkills.com/classroom</span> and enter this code</p>
              </div>
              <div className="bg-white/10 rounded-3xl p-5 mb-6">
                <p className="text-white font-black mb-3">👥 Players joined ({studentCount})</p>
                <div className="space-y-2">
                  {room.players.filter((p) => !p.isTeacher).length === 0 ? (
                    <div className="text-indigo-300 text-sm py-4 text-center animate-pulse">Waiting for students to join...</div>
                  ) : (
                    room.players.filter((p) => !p.isTeacher).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2.5">
                        <span className="text-2xl">{p.avatar}</span>
                        <span className="font-bold text-white">{p.name}</span>
                        <span className="ml-auto text-green-300 text-sm font-semibold">✓ Ready</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <button
                onClick={startGame}
                disabled={studentCount === 0}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl py-5 rounded-2xl hover:opacity-90 disabled:opacity-40 transition-opacity shadow-xl"
              >
                {studentCount === 0 ? "Waiting for students..." : `Start Game with ${studentCount} player${studentCount > 1 ? "s" : ""}! 🚀`}
              </button>
            </>
          ) : (
            /* Student lobby */
            <div className="text-center">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-7xl mb-4">{session.avatar}</motion.div>
              <h2 className="text-3xl font-black text-white mb-2">You&apos;re in, {session.name}!</h2>
              <p className="text-indigo-200 mb-8">Waiting for your teacher to start the game...</p>
              <div className="bg-white/10 rounded-3xl p-5 mb-6">
                <p className="text-indigo-200 text-sm font-semibold mb-3">Room {session.code} — Players ready:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {room.players.map((p) => (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                      <span className="text-3xl">{p.avatar}</span>
                      <span className="text-xs font-bold text-white/80">{p.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-1 mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.4, 1] }} transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.9 }}
                    className="w-3 h-3 rounded-full bg-indigo-300" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "playing" && session && room) {
    const problem = room.problems[localQ];
    if (!problem) {
      // Student finished all questions
      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex items-center justify-center px-4">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black mb-2">All done!</h2>
            <p className="text-indigo-200">Waiting for your classmates to finish...</p>
            <div className="mt-6 bg-white/10 rounded-3xl p-5 max-w-sm mx-auto">
              <Leaderboard compact />
            </div>
          </div>
        </div>
      );
    }

    // Teacher view during game — just leaderboard
    if (session.isTeacher) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-700 to-purple-800 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-white mb-6">
              <div>
                <h2 className="text-2xl font-black">🏆 Live Leaderboard</h2>
                <p className="text-indigo-300 text-sm">Room {session.code} · {studentCount} students</p>
              </div>
              <button onClick={endGame} className="bg-red-500 hover:bg-red-600 text-white font-black px-5 py-2 rounded-xl transition-colors text-sm">
                End Game
              </button>
            </div>
            <Leaderboard />
          </div>
        </div>
      );
    }

    // Student play view
    const { selected, correct } = answerState;
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-3 shadow">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{session.avatar}</span>
              <span className="font-bold text-sm">{session.name}</span>
            </div>
            <div className="text-sm font-black">
              Question {localQ + 1} / {room.questionCount}
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <span className="text-yellow-300 font-black">{myPlayer?.score ?? 0}</span>
              <span className="text-xs">pts</span>
            </div>
          </div>
          <div className="max-w-xl mx-auto mt-2">
            <div className="flex gap-1">
              {Array.from({ length: room.questionCount }, (_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < localQ ? "bg-green-400" : i === localQ ? "bg-yellow-400" : "bg-white/20"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-6">
          {/* Problem */}
          <div className={`rounded-3xl p-7 mb-5 shadow-lg border-4 transition-all duration-200 ${correct === true ? "bg-green-50 border-green-400" : correct === false ? "bg-red-50 border-red-400" : "bg-white border-indigo-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{problem.emoji}</span>
              <span className="text-xs font-black uppercase tracking-wide text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{problem.type}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 leading-snug">{problem.question}</p>
            {correct === true && <p className="text-green-600 font-black mt-2">🎉 Correct!</p>}
            {correct === false && <p className="text-red-600 font-black mt-2">The answer was {problem.answer}!</p>}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {problem.options.map((opt) => {
              let cls = "bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-800";
              if (selected !== null) {
                if (opt === problem.answer) cls = "bg-green-500 border-green-500 text-white scale-105";
                else if (opt === selected) cls = "bg-red-400 border-red-400 text-white";
                else cls = "bg-gray-100 border-gray-200 text-gray-400";
              }
              return (
                <button key={opt} onClick={() => submitAnswer(opt)} disabled={selected !== null}
                  className={`rounded-2xl py-5 text-2xl font-black transition-all duration-150 shadow-sm disabled:cursor-default ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Hint + mini leaderboard */}
          <div className="text-center mb-5">
            {!showHint ? (
              <button onClick={() => setShowHint(true)} className="text-indigo-400 hover:text-indigo-600 text-sm font-semibold">💡 Show hint</button>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-indigo-700 bg-indigo-100 rounded-xl px-4 py-2 text-sm font-semibold inline-block">
                💡 {problem.hint}
              </motion.p>
            )}
          </div>

          {/* Compact leaderboard */}
          <div className="bg-white/60 backdrop-blur rounded-3xl p-4">
            <p className="text-xs font-black text-gray-400 uppercase mb-3">Live Standings</p>
            <Leaderboard compact />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" && session && room) {
    const me = sorted.find((p) => p.id === session.playerId);
    const myFinalRank = me ? sorted.indexOf(me) : -1;
    const isWinner = myFinalRank === 0 && !session.isTeacher;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-800 px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <motion.div animate={{ rotate: isWinner ? [0, -10, 10, -10, 10, 0] : 0, scale: [1, 1.1, 1] }} transition={{ duration: 0.8 }} className="text-7xl mb-3">
              {isWinner ? "🏆" : myFinalRank === 1 ? "🥈" : myFinalRank === 2 ? "🥉" : "🎉"}
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-1">
              {isWinner ? "YOU WON! 🎊" : session.isTeacher ? "Game Over!" : `You finished ${myFinalRank + 1}${myFinalRank === 0 ? "st" : myFinalRank === 1 ? "nd" : myFinalRank === 2 ? "rd" : "th"}!`}
            </h2>
            {me && !session.isTeacher && (
              <p className="text-indigo-200">{me.score} / {room.questionCount} correct · {getMedal(myFinalRank)} rank</p>
            )}
          </div>

          <div className="bg-white/10 rounded-3xl p-5 mb-6">
            <h3 className="text-white font-black mb-4">🏅 Final Leaderboard</h3>
            <Leaderboard />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setPhase("home"); setSession(null); setRoom(null); setLocalQ(0); }}
              className="bg-white text-indigo-700 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-colors">
              🏫 New Game
            </button>
            <Link href="/practice/multiplication"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-opacity text-center">
              ✏️ Keep Practicing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

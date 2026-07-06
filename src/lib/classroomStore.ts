// In-memory room store.
// Works on any persistent Node.js server (Railway, Fly.io, local `npm run dev`).
// For Vercel serverless, replace `rooms` with Upstash Redis.

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strToSeed(s: string): number {
  return s.split("").reduce((acc, c) => ((acc * 31 + c.charCodeAt(0)) | 0), 0);
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ClassroomProblem {
  question: string;
  answer: number;
  options: number[];
  hint: string;
  emoji: string;
  type: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  currentQuestion: number;
  finished: boolean;
  isTeacher: boolean;
  lastSeen: number;
}

export type PublicPlayer = Omit<Player, "lastSeen">;

export type RoomPhase = "waiting" | "playing" | "ended";

export interface Room {
  code: string;
  teacherId: string;
  players: Map<string, Player>;
  phase: RoomPhase;
  problems: ClassroomProblem[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface RoomSnapshot {
  code: string;
  phase: RoomPhase;
  problems: ClassroomProblem[];
  players: PublicPlayer[];
  questionCount: number;
  startedAt?: number;
  endedAt?: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const rooms = new Map<string, Room>();

export function cleanupRooms() {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  for (const [code, room] of rooms) {
    if (room.createdAt < cutoff) rooms.delete(code);
  }
}

// ─── Problem generation ───────────────────────────────────────────────────────
function makeOptions(answer: number, rand: () => number): number[] {
  const offsets = seededShuffle([1, 2, 3, 5, 10, -1, -2, -3, -5, 7, -7, 4, -4, 6, -6, 8], rand);
  const wrong = new Set<number>();
  for (const o of offsets) {
    const w = answer + o;
    if (w >= 0 && w !== answer) wrong.add(w);
    if (wrong.size >= 3) break;
  }
  while (wrong.size < 3) {
    const w = Math.abs(answer + Math.floor(rand() * 12) - 6);
    if (w !== answer) wrong.add(w);
  }
  return seededShuffle([answer, ...Array.from(wrong).slice(0, 3)], rand);
}

type ProblemTemplate = (r: () => number) => ClassroomProblem;

const TEMPLATES: ProblemTemplate[] = [
  (r) => {
    const a = Math.floor(r() * 20) + 1, b = Math.floor(r() * 20) + 1;
    return { question: `${a} + ${b} = ?`, answer: a + b, options: makeOptions(a + b, r), hint: `Count up from ${a}`, emoji: "➕", type: "Addition" };
  },
  (r) => {
    const b = Math.floor(r() * 15) + 1, a = b + Math.floor(r() * 20) + 1;
    return { question: `${a} − ${b} = ?`, answer: a - b, options: makeOptions(a - b, r), hint: `${a} minus ${b}`, emoji: "➖", type: "Subtraction" };
  },
  (r) => {
    const a = Math.floor(r() * 11) + 2, b = Math.floor(r() * 11) + 2;
    return { question: `${a} × ${b} = ?`, answer: a * b, options: makeOptions(a * b, r), hint: `${a} groups of ${b}`, emoji: "✖️", type: "Multiplication" };
  },
  (r) => {
    const b = Math.floor(r() * 9) + 2, ans = Math.floor(r() * 10) + 1;
    return { question: `${b * ans} ÷ ${b} = ?`, answer: ans, options: makeOptions(ans, r), hint: `How many ${b}s in ${b * ans}?`, emoji: "➗", type: "Division" };
  },
  (r) => {
    const a = Math.floor(r() * 10) + 2, b = Math.floor(r() * 10) + 1;
    return { question: `${a} + __ = ${a + b}`, answer: b, options: makeOptions(b, r), hint: `${a + b} − ${a}`, emoji: "🔍", type: "Missing Number" };
  },
  (r) => {
    const a = Math.floor(r() * 12) + 2;
    return { question: `Double ${a} = ?`, answer: a * 2, options: makeOptions(a * 2, r), hint: `${a} + ${a}`, emoji: "🪞", type: "Doubles" };
  },
  (r) => {
    const ans = Math.floor(r() * 12) + 2;
    return { question: `Half of ${ans * 2} = ?`, answer: ans, options: makeOptions(ans, r), hint: `${ans * 2} ÷ 2`, emoji: "½", type: "Halves" };
  },
  (r) => {
    const a = Math.floor(r() * 9) + 2;
    return { question: `${a} × 10 = ?`, answer: a * 10, options: makeOptions(a * 10, r), hint: "Add a zero!", emoji: "🔟", type: "×10" };
  },
  (r) => {
    const rows = Math.floor(r() * 7) + 2, cols = Math.floor(r() * 7) + 2;
    return { question: `${rows} rows × ${cols} columns = ?`, answer: rows * cols, options: makeOptions(rows * cols, r), hint: `${rows} × ${cols}`, emoji: "⬛", type: "Grid" };
  },
  (r) => {
    const per = Math.floor(r() * 6) + 2, kids = Math.floor(r() * 5) + 2;
    return { question: `${kids} kids each get ${per} 🍬. Total candies?`, answer: per * kids, options: makeOptions(per * kids, r), hint: `${kids} × ${per}`, emoji: "🍬", type: "Word Problem" };
  },
  (r) => {
    const a = Math.floor(r() * 40) + 10, b = Math.floor(r() * 40) + 10;
    return { question: `${a} + ${b} = ?`, answer: a + b, options: makeOptions(a + b, r), hint: "Add tens first", emoji: "🔢", type: "Big Addition" };
  },
  (r) => {
    const kept = Math.floor(r() * 15) + 3, given = Math.floor(r() * 10) + 1;
    return { question: `Had ${kept + given} coins, gave ${given} away. How many left?`, answer: kept, options: makeOptions(kept, r), hint: `${kept + given} − ${given}`, emoji: "🪙", type: "Word Problem" };
  },
];

export function generateProblems(code: string, count = 10): ClassroomProblem[] {
  const rand = mulberry32(strToSeed(code));
  const shuffled = seededShuffle(TEMPLATES, rand);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((fn) => fn(rand));
}

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/1/0
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function getRoomSnapshot(room: Room): RoomSnapshot {
  const players: PublicPlayer[] = Array.from(room.players.values()).map(
    ({ lastSeen: _, ...p }) => p
  );
  return {
    code: room.code,
    phase: room.phase,
    problems: room.phase === "waiting" ? [] : room.problems,
    players,
    questionCount: room.problems.length,
    startedAt: room.startedAt,
    endedAt: room.endedAt,
  };
}

"use client";

export interface PlayerStats {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
  worldProgress: Record<string, number>;
  practiceScores: Record<string, number>;
  totalCorrect: number;
  totalAnswered: number;
}

const DEFAULT_STATS: PlayerStats = {
  name: "Math Hero",
  avatar: "🦸",
  xp: 0,
  level: 1,
  coins: 50,
  streak: 0,
  badges: [],
  worldProgress: {},
  practiceScores: {},
  totalCorrect: 0,
  totalAnswered: 0,
};

const XP_PER_LEVEL = 100;

export function getStats(): PlayerStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const stored = localStorage.getItem("kms_player");
    return stored ? { ...DEFAULT_STATS, ...JSON.parse(stored) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: PlayerStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("kms_player", JSON.stringify(stats));
}

export function addXP(amount: number): PlayerStats {
  const stats = getStats();
  stats.xp += amount;
  stats.level = Math.floor(stats.xp / XP_PER_LEVEL) + 1;
  saveStats(stats);
  return stats;
}

export function addCoins(amount: number): PlayerStats {
  const stats = getStats();
  stats.coins += amount;
  saveStats(stats);
  return stats;
}

export function recordAnswer(correct: boolean, world?: string): PlayerStats {
  const stats = getStats();
  stats.totalAnswered++;
  if (correct) {
    stats.totalCorrect++;
    stats.xp += 10;
    stats.coins += 5;
    stats.streak++;
    if (stats.streak % 5 === 0) stats.coins += 20;
    if (world) {
      stats.worldProgress[world] = (stats.worldProgress[world] || 0) + 1;
    }
    stats.level = Math.floor(stats.xp / XP_PER_LEVEL) + 1;
    checkBadges(stats);
  } else {
    stats.streak = 0;
  }
  saveStats(stats);
  return stats;
}

function checkBadges(stats: PlayerStats): void {
  const badges = [
    { id: "first_answer", label: "First Answer!", condition: stats.totalCorrect >= 1 },
    { id: "ten_streak", label: "10 Streak!", condition: stats.streak >= 10 },
    { id: "century", label: "100 Correct!", condition: stats.totalCorrect >= 100 },
    { id: "level_5", label: "Level 5!", condition: stats.level >= 5 },
    { id: "coin_hoard", label: "500 Coins!", condition: stats.coins >= 500 },
  ];
  for (const badge of badges) {
    if (badge.condition && !stats.badges.includes(badge.id)) {
      stats.badges.push(badge.id);
    }
  }
}

export function xpToNextLevel(stats: PlayerStats): number {
  return XP_PER_LEVEL - (stats.xp % XP_PER_LEVEL);
}

export function levelProgress(stats: PlayerStats): number {
  return (stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export const AVATARS = ["🦸", "🧙", "🦊", "🐉", "🦄", "🤖", "🐸", "🦁", "🐼", "🐯"];

export const BADGE_INFO: Record<string, { emoji: string; label: string }> = {
  first_answer: { emoji: "⭐", label: "First Answer!" },
  ten_streak: { emoji: "🔥", label: "10 Streak!" },
  century: { emoji: "💯", label: "100 Correct!" },
  level_5: { emoji: "🏆", label: "Level 5 Hero!" },
  coin_hoard: { emoji: "💰", label: "Coin Hoarder!" },
};

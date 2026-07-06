export interface Problem {
  question: string;
  answer: number;
  options: number[];
  hint?: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function wrongAnswers(answer: number, count = 3): number[] {
  const wrong = new Set<number>();
  const offsets = [1, 2, 3, 5, 10, -1, -2, -3, -5];
  for (const o of shuffle(offsets)) {
    const w = answer + o;
    if (w > 0 && w !== answer) wrong.add(w);
    if (wrong.size >= count) break;
  }
  while (wrong.size < count) {
    const w = Math.max(1, answer + Math.floor(Math.random() * 10) - 5);
    if (w !== answer) wrong.add(w);
  }
  return Array.from(wrong).slice(0, count);
}

function makeProblem(question: string, answer: number, hint?: string): Problem {
  const options = shuffle([answer, ...wrongAnswers(answer)]);
  return { question, answer, options, hint };
}

export function additionProblems(difficulty: number): Problem[] {
  const max = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 100;
  return Array.from({ length: 10 }, () => {
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    return makeProblem(`${a} + ${b} = ?`, a + b, `Count up from ${a}`);
  });
}

export function subtractionProblems(difficulty: number): Problem[] {
  const max = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 100;
  return Array.from({ length: 10 }, () => {
    const b = Math.floor(Math.random() * max);
    const a = b + Math.floor(Math.random() * max);
    return makeProblem(`${a} - ${b} = ?`, a - b, `Start at ${a}, count back`);
  });
}

export function multiplicationProblems(difficulty: number): Problem[] {
  const maxA = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 12;
  const maxB = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 12;
  return Array.from({ length: 10 }, () => {
    const a = Math.floor(Math.random() * maxA) + 1;
    const b = Math.floor(Math.random() * maxB) + 1;
    return makeProblem(`${a} × ${b} = ?`, a * b, `Think of ${a} groups of ${b}`);
  });
}

export function divisionProblems(difficulty: number): Problem[] {
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 12;
  return Array.from({ length: 10 }, () => {
    const b = Math.floor(Math.random() * max) + 1;
    const answer = Math.floor(Math.random() * max) + 1;
    const a = b * answer;
    return makeProblem(`${a} ÷ ${b} = ?`, answer, `How many ${b}s in ${a}?`);
  });
}

export function fractionProblems(difficulty: number): Problem[] {
  const denominators = difficulty === 1 ? [2, 4] : difficulty === 2 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 8];
  return Array.from({ length: 8 }, () => {
    const den = denominators[Math.floor(Math.random() * denominators.length)];
    const num1 = Math.floor(Math.random() * den) + 1;
    const num2 = Math.floor(Math.random() * den) + 1;
    if (difficulty === 1) {
      const answer = Math.floor((num1 / den) * 100);
      return makeProblem(`Which is bigger: ${num1}/${den} or ${num2}/${den}?`, Math.max(num1, num2), `Compare the numerators!`);
    }
    const answer = num1 + num2;
    return makeProblem(`${num1}/${den} + ${num2}/${den} = ?/${den}`, answer, `Add the tops, keep the bottom!`);
  });
}

export function countingProblems(difficulty: number): Problem[] {
  return Array.from({ length: 10 }, () => {
    const start = Math.floor(Math.random() * (difficulty * 10));
    const step = difficulty === 1 ? 1 : difficulty === 2 ? 2 : [5, 10][Math.floor(Math.random() * 2)];
    const count = Math.floor(Math.random() * 3) + 3;
    const sequence = Array.from({ length: count }, (_, i) => start + i * step);
    const next = start + count * step;
    return makeProblem(`${sequence.join(", ")}, ?`, next, `Count by ${step}s`);
  });
}

export function moneyProblems(difficulty: number): Problem[] {
  const coins = difficulty === 1
    ? [{ name: "penny", value: 1 }, { name: "nickel", value: 5 }, { name: "dime", value: 10 }]
    : [{ name: "penny", value: 1 }, { name: "nickel", value: 5 }, { name: "dime", value: 10 }, { name: "quarter", value: 25 }];
  return Array.from({ length: 8 }, () => {
    const picked = coins.slice(0, Math.floor(Math.random() * coins.length) + 1);
    const counts = picked.map(c => ({ ...c, count: Math.floor(Math.random() * 4) + 1 }));
    const total = counts.reduce((s, c) => s + c.value * c.count, 0);
    const desc = counts.map(c => `${c.count} ${c.name}${c.count > 1 ? "s" : ""}`).join(" + ");
    return makeProblem(`${desc} = ? cents`, total, `Add each coin's value`);
  });
}

export function timeProblems(difficulty: number): Problem[] {
  return Array.from({ length: 8 }, () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minuteOpts = difficulty === 1 ? [0, 30] : difficulty === 2 ? [0, 15, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const minute = minuteOpts[Math.floor(Math.random() * minuteOpts.length)];
    const minuteStr = minute.toString().padStart(2, "0");
    const addMinutes = (difficulty === 1 ? [15, 30, 60] : [15, 30, 45, 60, 90])[Math.floor(Math.random() * 3)];
    const totalMinutes = hour * 60 + minute + addMinutes;
    const newHour = Math.floor(totalMinutes / 60) % 12 || 12;
    const newMin = totalMinutes % 60;
    return makeProblem(
      `It's ${hour}:${minuteStr}. What time is it in ${addMinutes} minutes?`,
      newHour * 100 + newMin,
      `Add ${addMinutes} minutes to the current time`
    );
  });
}

export type PracticeType = "addition" | "subtraction" | "multiplication" | "division" | "fractions" | "counting" | "money" | "time";

export function getProblems(type: PracticeType, difficulty = 1): Problem[] {
  switch (type) {
    case "addition": return additionProblems(difficulty);
    case "subtraction": return subtractionProblems(difficulty);
    case "multiplication": return multiplicationProblems(difficulty);
    case "division": return divisionProblems(difficulty);
    case "fractions": return fractionProblems(difficulty);
    case "counting": return countingProblems(difficulty);
    case "money": return moneyProblems(difficulty);
    case "time": return timeProblems(difficulty);
  }
}

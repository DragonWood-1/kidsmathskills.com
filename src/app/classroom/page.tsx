import type { Metadata } from "next";
import ClassroomClient from "./ClassroomClient";

export const metadata: Metadata = {
  title: "Classroom Mode – Live Math Battles for Kids | KidsMathSkills",
  description:
    "Teachers: create a classroom game in seconds! Students join with a code and race to answer math problems on a live leaderboard. Free classroom math game.",
  keywords: [
    "classroom math game",
    "live math leaderboard",
    "math game for class",
    "teacher math tool",
    "kids multiplayer math",
    "math class game",
  ],
  openGraph: {
    title: "Classroom Mode – Real-Time Math Battles!",
    description: "Create a room, share the code, and watch your class compete on a live math leaderboard.",
  },
};

export default function ClassroomPage() {
  return <ClassroomClient />;
}

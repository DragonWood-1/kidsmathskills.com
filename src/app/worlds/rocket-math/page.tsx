import type { Metadata } from "next";
import RocketMathClient from "./RocketMathClient";

export const metadata: Metadata = {
  title: "Rocket Math Academy - Space Math Missions | KidsMathSkills",
  description: "Blast through space math missions! Planet-level skill progression, timed challenges, and AI tutor. Math games for grades 2-5.",
};

export default function RocketMathPage() {
  return <RocketMathClient />;
}

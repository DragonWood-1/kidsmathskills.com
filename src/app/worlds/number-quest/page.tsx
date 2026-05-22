import type { Metadata } from "next";
import NumberQuestClient from "./NumberQuestClient";

export const metadata: Metadata = {
  title: "Number Quest - Math Adventure World | KidsMathSkills",
  description: "Travel through magical math islands! Solve equations, defeat boss battles, earn XP and badges in this epic math adventure for kids.",
};

export default function NumberQuestPage() {
  return <NumberQuestClient />;
}

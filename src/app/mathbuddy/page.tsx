import type { Metadata } from "next";
import MathBuddyClient from "./MathBuddyClient";

export const metadata: Metadata = {
  title: "MathBuddy AI Tutor – Free Math Help for Kids | KidsMathSkills",
  description:
    "MathBuddy is a friendly AI math tutor for kids K–6. Get instant, encouraging help with addition, multiplication, fractions, and more. Free and fun!",
  keywords: [
    "AI math tutor for kids",
    "free math help for children",
    "online math tutor",
    "kids math help",
    "elementary math tutor",
    "math homework help",
  ],
  openGraph: {
    title: "MathBuddy – Your Friendly AI Math Tutor",
    description: "Get fun, patient math help anytime. MathBuddy explains mistakes gently and celebrates every win!",
  },
};

export default function MathBuddyPage() {
  return <MathBuddyClient />;
}

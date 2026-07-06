import type { Metadata } from "next";
import DailyClient from "./DailyClient";

export const metadata: Metadata = {
  title: "Daily Math Challenge – Free Kids Math Problem of the Day | KidsMathSkills",
  description:
    "A new math challenge every day for kids K–6! Build your streak, earn bonus coins, and become a math champion. 5 problems, fresh every morning.",
  keywords: [
    "daily math challenge for kids",
    "math problem of the day",
    "kids math streak",
    "daily math practice",
    "elementary math challenge",
  ],
  openGraph: {
    title: "Daily Math Challenge – New Problems Every Day!",
    description: "5 fresh math problems every day. Build your streak and earn bonus rewards!",
  },
};

export default function DailyPage() {
  return <DailyClient />;
}

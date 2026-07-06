import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Parent & Teacher Dashboard - Track Math Progress | KidsMathSkills",
  description: "Track your child's math progress! See XP, coins, badges, streaks, accuracy, and which topics need more practice. Free parent and teacher dashboard.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}

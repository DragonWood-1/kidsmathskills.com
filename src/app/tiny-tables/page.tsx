import type { Metadata } from "next";
import TinyTablesClient from "./TinyTablesClient";

export const metadata: Metadata = {
  title: "TinyTables - Multiplication Mastery Games | KidsMathSkills",
  description: "Master multiplication tables with speed drills, rhythm mode, leaderboards, and printable certificates! The fastest way to learn times tables for kids.",
  keywords: "multiplication tables, times tables games, multiplication speed drills, times tables practice, multiplication mastery, TinyTables",
};

export default function TinyTablesPage() {
  return <TinyTablesClient />;
}

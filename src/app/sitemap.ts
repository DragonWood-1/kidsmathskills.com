import type { MetadataRoute } from "next";

const BASE_URL = "https://kidsmathskills.com";

const ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/daily", priority: 0.9, changeFrequency: "daily" },
  { path: "/worlds", priority: 0.9, changeFrequency: "weekly" },
  { path: "/worlds/number-quest", priority: 0.8, changeFrequency: "weekly" },
  { path: "/worlds/math-zoo", priority: 0.8, changeFrequency: "weekly" },
  { path: "/worlds/rocket-math", priority: 0.8, changeFrequency: "weekly" },
  { path: "/worlds/math-kingdom", priority: 0.8, changeFrequency: "weekly" },
  { path: "/worlds/treasure-math", priority: 0.8, changeFrequency: "weekly" },
  { path: "/practice/addition", priority: 0.8, changeFrequency: "weekly" },
  { path: "/practice/multiplication", priority: 0.8, changeFrequency: "weekly" },
  { path: "/practice/fractions", priority: 0.8, changeFrequency: "weekly" },
  { path: "/practice/counting", priority: 0.8, changeFrequency: "weekly" },
  { path: "/mathbuddy", priority: 0.8, changeFrequency: "monthly" },
  { path: "/drawmath", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tiny-tables", priority: 0.7, changeFrequency: "monthly" },
  { path: "/classroom", priority: 0.7, changeFrequency: "monthly" },
  { path: "/worksheets", priority: 0.7, changeFrequency: "weekly" },
  { path: "/dashboard", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

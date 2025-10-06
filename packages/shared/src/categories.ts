export const categories = [
  { label: "Fitness & Health", id: "fitness" },
  { label: "Learning & Education", id: "study" },
  { label: "Career & Business", id: "career" },
  { label: "Lifestyle & Hobbies", id: "lifestyle" },
  { label: "Creative & Arts", id: "creative" },
  { label: "Technology", id: "tech" },
] as const

export type Category = (typeof categories)[number]["id"]

export function getCategoryLabel(category: Category | "all") {
  if (category === "all") {
    return "All"
  }
  const found = categories.find((cat) => cat.id === category)
  return found ? found.label : "Unknown"
}

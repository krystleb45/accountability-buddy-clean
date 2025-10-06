import type { Category } from "@ab/shared/categories"

import {
  BicepsFlexedIcon,
  BookOpenTextIcon,
  BriefcaseBusinessIcon,
  EllipsisIcon,
  LaptopIcon,
  PaletteIcon,
  SproutIcon,
} from "lucide-react"

export const categories = [
  {
    id: "fitness",
    label: "Fitness",
    description: "Health, exercise, and wellness",
    icon: BicepsFlexedIcon,
  },
  {
    id: "study",
    label: "Study",
    description: "Learning, reading, and personal growth",
    icon: BookOpenTextIcon,
  },
  {
    id: "career",
    label: "Career",
    description: "Professional development and work-related goals",
    icon: BriefcaseBusinessIcon,
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Hobbies, travel, and everyday life",
    icon: SproutIcon,
  },
  {
    id: "creative",
    label: "Creative",
    description: "Art, music, writing, and other creative pursuits",
    icon: PaletteIcon,
  },
  {
    id: "tech",
    label: "Technology",
    description: "Coding, software development, and tech skills",
    icon: LaptopIcon,
  },
] as const

export const categoriesWithAll = [
  { id: "all", label: "All", icon: EllipsisIcon },
  ...categories,
] as const

export function getCategoriesWithCount(
  counts: Record<Category | "all", number>,
) {
  return categoriesWithAll.map((category) => ({
    ...category,
    count: counts[category.id] || 0,
  }))
}

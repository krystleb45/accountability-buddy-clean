import type { getCategoriesWithCount } from "@/lib/categories"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardTitle } from "./ui/card"

interface CategoryFilterButtonProps {
  category: ReturnType<typeof getCategoriesWithCount>[number]
  onClick: (categoryId: string) => void
  isSelected: boolean
  label: string
}

export function CategoryFilterButton({
  category,
  onClick,
  isSelected,
  label,
}: CategoryFilterButtonProps) {
  return (
    <button
      type="button"
      key={category.id}
      onClick={() => onClick(category.id)}
      className="group block flex-1 shrink-0 cursor-pointer"
    >
      <Card
        className={cn(
          `
            size-full py-4 transition-colors
            group-hover:bg-accent
            md:py-6
          `,
          {
            "border-2 border-primary": isSelected,
          },
        )}
      >
        <CardContent
          className={`
            flex items-center gap-4 px-4 text-left
            md:flex-col md:items-center md:px-6 md:text-center
          `}
        >
          <category.icon className="size-8 shrink-0 text-primary" />
          <div>
            <CardTitle
              className={`
                mb-1
                md:mb-2
              `}
            >
              {category.label}
            </CardTitle>
            <CardDescription className="whitespace-nowrap">
              {category.count} {label}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"

import { cn } from "@/lib/utils"

function RadioGroup({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<
    typeof RadioGroupPrimitive.Root
  > | null>
}) {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
}
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

function RadioGroupItem({
  ref,
  className,
  indicatorClassName,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  ref?: React.RefObject<React.ComponentRef<
    typeof RadioGroupPrimitive.Item
  > | null>
  indicatorClassName?: string
}) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        `
          aspect-square h-4 w-4 rounded-full border border-primary text-primary
          shadow
          focus:outline-none
          focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className={cn(`flex items-center justify-center`, indicatorClassName)}
      >
        <div className="h-3 w-3 rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

// src/components/UtilityComponents/SkeletonComponent.tsx
"use client"

import React from "react"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** anything else you need… */
}

/** A simple “loading placeholder” rectangle */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  ...rest
}) => (
  <div
    className={`${className} animate-pulse bg-gray-700`}
    aria-busy="true"
    {...rest}
  />
)

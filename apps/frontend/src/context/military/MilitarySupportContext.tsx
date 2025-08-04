// src/context/military/MilitarySupportContext.tsx
"use client"

import type { ReactNode } from "react"

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

interface MilitaryResource {
  id: string
  title: string
  description: string
  link: string
}

interface MilitarySupportContextType {
  resources: MilitaryResource[]
  addResource: (resource: MilitaryResource) => void
  removeResource: (id: string) => void
  updateResource: (id: string, updated: Partial<MilitaryResource>) => void
}

const MilitarySupportContext = createContext<
  MilitarySupportContextType | undefined
>(undefined)

export function useMilitarySupport(): MilitarySupportContextType {
  const ctx = use(MilitarySupportContext)
  if (!ctx) {
    throw new Error(
      "useMilitarySupport must be used within MilitarySupportProvider",
    )
  }
  return ctx
}

export const MilitarySupportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resources, setResources] = useState<MilitaryResource[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("militaryResources") || "[]")
      } catch {
        return []
      }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem("militaryResources", JSON.stringify(resources))
  }, [resources])

  // Optionally fetch from an API:
  // useEffect(() => {
  //   fetch('/api/military-resources')
  //     .then(r => r.json())
  //     .then(setResources)
  //     .catch(console.error);
  // }, []);

  const addResource = useCallback((resource: MilitaryResource) => {
    setResources((prev) => [...prev, resource])
  }, [])

  const removeResource = useCallback((id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const updateResource = useCallback(
    (id: string, updated: Partial<MilitaryResource>) => {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({ resources, addResource, removeResource, updateResource }),
    [resources, addResource, removeResource, updateResource],
  )

  return (
    <MilitarySupportContext value={value}>{children}</MilitarySupportContext>
  )
}

export default MilitarySupportProvider

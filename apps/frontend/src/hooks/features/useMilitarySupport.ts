// src/hooks/features/useMilitarySupport.ts
import { useCallback, useEffect, useState } from "react"

import { API } from "@/constants/apiEndpoints"
import { http } from "@/utils/http"

export interface MilitaryResource {
  id: string
  title: string
  description: string
  link: string
}

export interface UseMilitarySupportReturnType {
  resources: MilitaryResource[]
  loading: boolean
  error: string | null
  fetchResources: () => Promise<void>
  addResource: (newResource: Omit<MilitaryResource, "id">) => Promise<void>
  updateResource: (
    id: string,
    updatedResource: Partial<MilitaryResource>,
  ) => Promise<void>
  deleteResource: (id: string) => Promise<void>
}

function useMilitarySupport(): UseMilitarySupportReturnType {
  const [resources, setResources] = useState<MilitaryResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await http.get<MilitaryResource[]>(
        API.MILITARY_SUPPORT.LIST,
      )
      setResources(data)
    } catch (err: unknown) {
      setError(
        (err instanceof Error && err.message) || "Failed to fetch resources.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const addResource = useCallback(
    async (newResource: Omit<MilitaryResource, "id">) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await http.post<MilitaryResource>(
          API.MILITARY_SUPPORT.CREATE,
          newResource,
        )
        setResources((prev) => [...prev, data])
      } catch (err: unknown) {
        setError(
          (err instanceof Error && err.message) || "Failed to add resource.",
        )
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const updateResource = useCallback(
    async (id: string, updatedResource: Partial<MilitaryResource>) => {
      setLoading(true)
      setError(null)
      try {
        const url = API.MILITARY_SUPPORT.UPDATE.replace(":id", id)
        const { data } = await http.put<MilitaryResource>(url, updatedResource)
        setResources((prev) => prev.map((r) => (r.id === id ? data : r)))
      } catch (err: unknown) {
        setError(
          (err instanceof Error && err.message) || "Failed to update resource.",
        )
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const deleteResource = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = API.MILITARY_SUPPORT.DELETE.replace(":id", id)
      await http.delete(url)
      setResources((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      setError(
        (err instanceof Error && err.message) || "Failed to delete resource.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return {
    resources,
    loading,
    error,
    fetchResources,
    addResource,
    updateResource,
    deleteResource,
  }
}

export default useMilitarySupport

// src/hooks/useFetch.ts
"use client"

import type { AxiosRequestConfig } from "axios"

import { isAxiosError } from "axios" // ← import this
import { useEffect, useRef, useState } from "react"

import { http } from "@/lib/http"

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useFetch<T>(
  url: string,
  config?: AxiosRequestConfig,
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const configRef = useRef<AxiosRequestConfig | undefined>(config)
  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    http({
      url,
      method: "get",
      signal: controller.signal,
      ...configRef.current,
    })
      .then((resp) => {
        setData(resp.data as T)
      })
      .catch((err: unknown) => {
        // swallow only the cancellation
        if (isAxiosError(err) && err.code === "ERR_CANCELED") {
          return
        }

        console.error("useFetch error:", err)
        if (isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Failed to fetch data")
        } else {
          setError("An unexpected error occurred")
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [url])

  return { data, loading, error }
}

export default useFetch

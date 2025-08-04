// src/hooks/seo/useSeo.ts
import { useEffect } from "react"

/**
 * Set document.title.
 */
export function useTitle(title: string): void {
  useEffect(() => {
    if (title) document.title = title
  }, [title])
}

/**
 * Create or update a <meta name="{name}" content="{content}"> in <head>.
 */
export function useMeta(name: string, content: string): void {
  useEffect(() => {
    if (!content) return
    let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!tag) {
      tag = document.createElement("meta")
      tag.setAttribute("name", name)
      document.head.appendChild(tag)
    }
    tag.setAttribute("content", content)
  }, [name, content])
}

export interface SeoProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  // open-graph
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
}

/**
 * Convenience hook that sets title + common meta tags.
 */
export function useSeo({
  title,
  description,
  keywords,
  author,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
}: SeoProps): void {
  useTitle(title ?? "")
  useMeta("description", description ?? "")
  useMeta("keywords", keywords ?? "")
  useMeta("author", author ?? "")

  // Open-Graph tags
  useMeta("og:title", ogTitle ?? title ?? "")
  useMeta("og:description", ogDescription ?? description ?? "")
  useMeta("og:image", ogImage ?? "")
  useMeta(
    "og:url",
    ogUrl ?? (typeof window !== "undefined" ? window.location.href : ""),
  )
}

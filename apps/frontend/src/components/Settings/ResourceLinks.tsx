"use client"

import { motion } from "motion/react"
import React, { useEffect, useState } from "react"

import styles from "./ResourceLinks.module.css"

interface Resource {
  id: string
  name: string
  link: string
}

const ResourceLinks: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/militarySupport/resources")
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        const data: Resource[] = await res.json()
        setResources(data)
      } catch (err: unknown) {
        console.error("❌ Failed to fetch resources:", err)
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchResources()
  }, [])

  return (
    <motion.section
      className={styles.resources}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      role="region"
      aria-labelledby="resources-header"
    >
      <h2 id="resources-header" className={styles.heading}>
        Helpful Resources
      </h2>

      {loading ? (
        <p className={styles.loading}>Loading resources…</p>
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : resources.length > 0 ? (
        <ul className={styles.list}>
          {resources.map((resource) => (
            <li key={resource.id} className={styles.item}>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                aria-label={`Open resource: ${resource.name}`}
              >
                {resource.name}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No resources available at the moment.</p>
      )}
    </motion.section>
  )
}

export default ResourceLinks

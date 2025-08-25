"use client"

import type { FormEvent } from "react"

import { motion } from "motion/react"
import { useState } from "react"

export default function SearchClient() {
  const [query, setQuery] = useState("")
  // const [results, setResults] = useState([])
  // const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    // setSubmitted(true)
    setError(null)

    const q = query.trim()
    if (!q) {
      // setResults([])
      return
    }

    try {
      // const response = await searchService.search(q, "all" )
      // setResults(response.results)
    } catch (err: unknown) {
      console.error("Search error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching. Please try again.",
      )
      // setResults([])
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold text-primary">Search</h1>
        <p className="text-gray-400">Find users, goals, or other content.</p>
      </motion.header>

      <form onSubmit={handleSearch} className="mb-6 flex justify-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`
            w-full max-w-md rounded-lg border bg-gray-800 p-3 text-white
            focus:border-primary focus:ring focus:ring-green-200
            focus:outline-none
          `}
          placeholder="Enter your search query..."
          aria-label="Search query"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 rounded-lg bg-primary p-3 text-black transition"
          aria-label="Submit search"
        >
          Search
        </motion.button>
      </form>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="rounded-lg bg-gray-900 p-6 shadow-md"
      >
        <h2 className="mb-4 text-2xl font-semibold text-primary">Results</h2>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        {/* {!submitted ? (
          <p className="text-center text-gray-400">Enter a query to search.</p>
        ) : results.length > 0 ? (
          results.map((r) => (
            <motion.div
              key={`${r.type}-${r.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-2 rounded-lg bg-gray-900 p-4 shadow-md"
            >
              <p className="font-semibold text-white">{r.title}</p>
              <p className="mb-2 text-sm text-gray-400 capitalize">
                Type: {r.type}
              </p>
              {r.id && (
                <Link
                  href={`/${r.type}/${r.id}`}
                  className={`
                    text-sm text-green-400
                    hover:underline
                  `}
                >
                  View Details →
                </Link>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400">
            No results found for “{query}”.
          </p>
        )} */}
      </motion.main>
    </div>
  )
}

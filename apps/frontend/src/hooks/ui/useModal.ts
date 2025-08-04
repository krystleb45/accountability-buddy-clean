import { useCallback, useState } from "react"

/**
 * Type definition for the return value of the `useModal` hook.
 *
 * @template T - The type of the modal content.
 */
interface UseModalReturn<T> {
  isOpen: boolean
  content: T | null
  open: (content: T | null) => void
  close: () => void
  toggle: () => void
  setContent: (content: T | null) => void
}

/**
 * Custom hook for managing modals.
 *
 * Provides utilities to control the visibility and content of modals.
 *
 * @template T - The type of the modal content (default is `unknown`).
 * @returns An object containing modal state, handlers to open/close/toggle modals,
 *          and a function to set modal content.
 */
function useModal<T = unknown>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContentState] = useState<T | null>(null)

  const open = useCallback((newContent: T | null) => {
    setContentState(newContent)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setContentState(null)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const setContent = useCallback((newContent: T | null) => {
    setContentState(newContent)
  }, [])

  return {
    isOpen,
    content,
    open,
    close,
    toggle,
    setContent,
  }
}

export default useModal

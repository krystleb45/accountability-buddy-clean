import type { ReactNode } from "react"

export interface ModalProps {
  /**
   * Whether the modal is visible.
   */
  isVisible: boolean

  /**
   * Function to handle closing the modal.
   */
  onClose: () => void

  /**
   * Optional title text to display in the modal header.
   */
  title?: string

  /**
   * Optional content to display inside the modal body.
   */
  content?: ReactNode
}

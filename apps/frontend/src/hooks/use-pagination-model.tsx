import { useMemo } from "react"
import { getPaginationModel } from "ultimate-pagination"

export function usePaginationModel({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  return useMemo(() => {
    return getPaginationModel({ currentPage, totalPages })
  }, [currentPage, totalPages])
}

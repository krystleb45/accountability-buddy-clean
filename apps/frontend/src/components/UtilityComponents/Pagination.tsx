import React from "react"

import "./Pagination.css" // CSS for styling the pagination

interface PaginationProps {
  currentPage: number // The current active page
  totalPages: number // The total number of pages
  onPageChange: (page: number) => void // Callback for changing the page
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null // Hide pagination if there's only one page

  // Generate an array of page numbers
  const getPageNumbers = (): number[] => {
    const pages: number[] = [] // Explicitly type the array to accept numbers
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i) // Now TypeScript knows that 'i' (a number) can be pushed into 'pages'
    }
    return pages
  }

  // Navigate to the previous page
  const handlePrevious = (): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  // Navigate to the next page
  const handleNext = (): void => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <nav className="pagination" aria-label="Pagination Navigation">
      {/* Previous Button */}
      <button
        className="pagination-button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        &laquo; Prev
      </button>

      {/* Page Numbers */}
      <ul className="pagination-list">
        {getPageNumbers().map((page) => (
          <li key={page} className="pagination-item">
            <button
              className={`pagination-button ${page === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>

      {/* Next Button */}
      <button
        className="pagination-button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next &raquo;
      </button>
    </nav>
  )
}

export default Pagination

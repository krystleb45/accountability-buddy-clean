export function paginate (totalItems: number,  currentPage: number,  pageSize: number) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

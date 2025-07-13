/**
 * Represents pagination parameters for API requests.
 */
export interface PaginationParams {
  /** The current page number. */
  page: number;

  /** The number of items per page. */
  limit: number;
}

/**
 * Represents the structure of paginated data in API responses.
 */
export interface PaginatedData<T> {
  /** The array of items on the current page. */
  items: T[];

  /** The total number of items available. */
  totalItems: number;

  /** The total number of pages available. */
  totalPages: number;

  /** The current page number. */
  currentPage: number;

  /** The number of items per page. */
  itemsPerPage: number;
}

/**
 * Represents a key-value pair for generic filters.
 */
export interface Filter {
  /** The key to filter by. */
  key: string;

  /** The value to filter by. */
  value: string | number | boolean | null;
}

/**
 * Represents sorting options for API queries.
 */
export interface SortOption {
  /** The field to sort by. */
  field: string;

  /** The direction to sort in (`asc` for ascending, `desc` for descending). */
  direction: 'asc' | 'desc';
}

/**
 * Represents a standard timestamp structure.
 */
export interface Timestamps {
  /** The timestamp of creation. */
  createdAt: string;

  /** The timestamp of the last update. */
  updatedAt?: string;

  /** The timestamp of deletion, if applicable. */
  deletedAt?: string;
}

/**
 * Represents a generic key-value map.
 */
export interface KeyValueMap {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Represents an option in a dropdown menu or selector.
 */
export interface DropdownOption {
  /** The label to display for the option. */
  label: string;

  /** The value associated with the option. */
  value: string | number | boolean;
}

/**
 * Represents a standard API query for filtering, sorting, and pagination.
 */
export interface ApiQuery {
  /** Array of filters to apply. */
  filters?: Filter[];

  /** Sorting options for the query. */
  sort?: SortOption[];

  /** Pagination parameters for the query. */
  pagination?: PaginationParams;
}

/**
 * Represents a file upload type.
 */
export interface FileUpload {
  /** The file name. */
  name: string;

  /** The MIME type of the file. */
  type: string;

  /** The size of the file in bytes. */
  size: number;

  /** The actual file data as a `File` object. */
  file: File;
}

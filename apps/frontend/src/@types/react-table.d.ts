/**
 * TypeScript type definitions for extending react-table functionality.
 * These definitions allow customization of columns, rows, and table properties.
 */

import {
  UseTableInstanceProps,
  UseTableOptions,
  UseTableRowProps,
  UseTableColumnProps,
  UseSortByInstanceProps,
  UseSortByOptions,
  UsePaginationInstanceProps,
  UsePaginationOptions,
} from 'react-table';

// Define a generic interface for your table data
export interface TableData {
  id: string | number;
  [key: string]: unknown; // Allow additional dynamic fields
}

// Extend react-table with custom types for columns and rows
declare module 'react-table' {
  export interface TableOptions<D extends Record<string, unknown> = TableData>
    extends UseTableOptions<D>,
      UseSortByOptions<D>,
      UsePaginationOptions<D> {
    /**
     * Custom options for your table, if any
     */
  }

  export interface ColumnInterface<D extends Record<string, unknown> = TableData>
    extends UseTableColumnProps<D> {
    /**
     * Add custom properties for columns
     * Example: Specify a column as sortable or filterable
     */
    isSortable?: boolean;
    isFilterable?: boolean;
  }

  export interface TableInstance<D extends Record<string, unknown> = TableData>
    extends UseTableInstanceProps<D>,
      UseSortByInstanceProps<D>,
      UsePaginationInstanceProps<D> {
    /**
     * Add custom methods or properties for the table instance
     */
  }

  export interface TableRow<D extends Record<string, unknown> = TableData>
    extends UseTableRowProps<D> {
    /**
     * Add custom properties for rows
     */
    isSelected?: boolean;
  }

  export type TableColumn<D extends Record<string, unknown> = TableData> = UseTableColumnProps<D>;
}

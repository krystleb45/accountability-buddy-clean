// Utility functions for Progress components

/**
 * Calculates the progress percentage, ensuring it's between 0 and 100.
 * @param value - The current progress value.
 * @returns A number between 0 and 100.
 */
export const calculateProgress = (value: number): number => {
  return Math.max(0, Math.min(value, 100));
};

/**
 * Formats a date into a readable string.
 * @param date - The date to format.
 * @returns A formatted date string.
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generates default chart dataset for analytics.
 * @param label - The label for the dataset.
 * @param data - The data points for the dataset.
 * @param color - The color for the dataset (optional).
 * @returns A chart dataset object.
 */
export const generateChartDataset = (
  label: string,
  data: number[],
  color: string = 'rgba(75, 192, 192, 0.2)',
): {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  fill: boolean;
} => {
  return {
    label,
    data,
    backgroundColor: color,
    borderColor: color.replace('0.2', '1'),
    fill: true,
  };
};

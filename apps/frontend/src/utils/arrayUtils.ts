/**
 * Removes duplicate elements from an array while preserving the order.
 * @param arr - The array to deduplicate.
 * @returns A new array with unique values.
 */
export const uniqueArray = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};

/**
 * Shuffles an array using the Fisher-Yates shuffle algorithm.
 * @param arr - The array to shuffle.
 * @returns A new shuffled array.
 */
export const shuffleArray = <T>(arr: T[]): T[] => {
  if (!Array.isArray(arr) || arr.length === 0) return []; // Ensure valid array

  const arrayCopy: T[] = [...arr];

  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // Ensure that arrayCopy[j] is not undefined before swapping
    if (arrayCopy[j] !== undefined && arrayCopy[i] !== undefined) {
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j]!, arrayCopy[i]!]; // Non-null assertion
    }
  }

  return arrayCopy;
};

/**
 * Splits an array into chunks of a given size.
 * @param arr - The array to split.
 * @param chunkSize - The maximum size of each chunk.
 * @returns An array of chunks.
 * @throws Throws an error if chunkSize is not a positive integer.
 */
export const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('Chunk size must be a positive integer.');
  }
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Flattens a nested array to a specified depth.
 * @param arr - The nested array to flatten.
 * @param depth - The depth level to flatten (default is Infinity).
 * @returns A flattened array.
 */
export const flattenArray = <T>(arr: unknown[], depth: number = Infinity): T[] => {
  return arr.flat(depth) as T[];
};

/**
 * Finds the most frequently occurring element(s) in an array.
 * @param arr - The array to analyze.
 * @returns An array of the most common elements.
 */
export const mostFrequentElements = <T>(arr: T[]): T[] => {
  const frequencyMap = new Map<T, number>();
  arr.forEach((item) => {
    frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
  });

  const maxFrequency = Math.max(...frequencyMap.values());
  return Array.from(frequencyMap.entries())
    .filter(([_, count]) => count === maxFrequency)
    .map(([item]) => item);
};

/**
 * Checks if two arrays are equal (same elements, same order).
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns True if arrays are equal, false otherwise.
 */
export const areArraysEqual = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

/**
 * Merges two arrays and removes duplicates.
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns A new merged array with unique values.
 */
export const mergeUniqueArrays = <T>(arr1: T[], arr2: T[]): T[] => {
  return uniqueArray([...arr1, ...arr2]);
};

/**
 * Partitions an array into two groups based on a predicate function.
 * @param arr - The array to partition.
 * @param predicate - The function to determine group membership.
 * @returns A tuple containing two arrays: [matchesPredicate, doesNotMatchPredicate].
 */
export const partitionArray = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  return arr.reduce<[T[], T[]]>(
    (acc, item) => {
      acc[predicate(item) ? 0 : 1].push(item);
      return acc;
    },
    [[], []],
  );
};

/**
 * Sorts an array of objects based on a specified key.
 * @param arr - The array of objects to sort.
 * @param key - The key to sort by.
 * @param ascending - Whether to sort in ascending order (default is true).
 * @returns A new sorted array.
 */
export const sortByKey = <T, K extends keyof T>(
  arr: T[],
  key: K,
  ascending: boolean = true,
): T[] => {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * Finds the intersection of two arrays (common elements).
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns An array of common elements.
 */
export const arrayIntersection = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter((item) => arr2.includes(item));
};

/**
 * Finds the difference between two arrays (elements in arr1 that are not in arr2).
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns An array of elements present in arr1 but not in arr2.
 */
export const arrayDifference = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter((item) => !arr2.includes(item));
};

/**
 * Finds the union of two arrays (all unique elements from both).
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @returns An array containing all unique elements from both arrays.
 */
export const arrayUnion = <T>(arr1: T[], arr2: T[]): T[] => {
  return uniqueArray([...arr1, ...arr2]);
};

export default {
  uniqueArray,
  shuffleArray,
  chunkArray,
  flattenArray,
  mostFrequentElements,
  areArraysEqual,
  mergeUniqueArrays,
  partitionArray,
  sortByKey,
  arrayIntersection,
  arrayDifference,
  arrayUnion,
};

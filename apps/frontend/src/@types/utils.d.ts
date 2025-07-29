export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

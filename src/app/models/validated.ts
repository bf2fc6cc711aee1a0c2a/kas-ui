export type Validated<T> = {
  value: T;
  validated?: 'success' | 'warning' | 'error' | 'default';
  errorMessage?: string;
};

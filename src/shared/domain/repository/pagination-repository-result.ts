export type PaginationRepositoryResult<T> = {
  items: T[];
  count: number;
  pageSize: number | null;
};

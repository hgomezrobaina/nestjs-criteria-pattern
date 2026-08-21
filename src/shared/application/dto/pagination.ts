export interface PaginationResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

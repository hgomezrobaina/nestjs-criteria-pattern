import { CriteriaFilter } from "./criteria-filter";
import { CriteriaOrder } from "./criteria-order";

type Props = {
  filters?: CriteriaFilter[];
  order?: CriteriaOrder | null;
  page?: number | null;
  pageSize?: number | null;
  search?: string | null;
};

/**
 * The description of a list: what is filtered, how it is sorted and which page.
 *
 * This file imports nothing: no NestJS, no driver, no ORM. It compiles with the
 * project's dependencies uninstalled, and that is what lets the same object travel
 * from a use case to a Mongo repository, to a SQL one, or to an in-memory double.
 */
export abstract class Criteria<T extends string> {
  private _filters: CriteriaFilter[];
  private _order: CriteriaOrder | null;
  private _page: number | null;
  private _pageSize: number | null;
  private _search: string | null;

  constructor({ filters, order, page, pageSize, search }: Props = {}) {
    this._filters = filters ?? [];
    this._order = order ?? null;
    this._page = page ?? null;
    this._pageSize = pageSize ?? null;
    this._search = search ?? null;
  }

  get filters(): CriteriaFilter[] {
    return this._filters;
  }

  get order(): CriteriaOrder | null {
    return this._order;
  }

  get page(): number | null {
    return this._page;
  }

  get pageSize(): number | null {
    return this._pageSize;
  }

  get search(): string | null {
    return this._search;
  }

  // Replaces the whole list: this is what the mapper does with what the request
  // brings, so it must only ever be used with the client's own filters.
  setFilters(v: CriteriaFilter[]): void {
    this._filters = v;
  }

  // Accumulates: what the server imposes is added AFTER the mapper has run, so a
  // client sending its own `filters` cannot drop it.
  addFilters(v: CriteriaFilter[]): void {
    this._filters = [...this._filters, ...v];
  }

  addFilter(v: CriteriaFilter): void {
    this._filters = [...this._filters, v];
  }

  setOrder(v: CriteriaOrder): void {
    this._order = v;
  }

  setPage(v: number): void {
    this._page = v;
  }

  setPageSize(v: number): void {
    this._pageSize = v;
  }

  setSearch(v: string | null): void {
    this._search = v;
  }

  hasFilters(): boolean {
    return this._filters.length > 0;
  }

  /**
   * Returns a list and not a single filter because one field can carry two of them:
   * `publishedAt` after one date and before another is an interval, and whoever
   * translates needs both at once.
   */
  find(field: T): CriteriaFilter[] {
    return this._filters.filter((f) => f.field === field);
  }
}

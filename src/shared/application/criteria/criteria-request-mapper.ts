import { Criteria } from "@shared/domain/criteria/criteria";
import { CriteriaFilter } from "@shared/domain/criteria/criteria-filter";
import { CriteriaOrder } from "@shared/domain/criteria/criteria-order";
import { CriteriaStringFilter } from "@shared/domain/criteria/criteria-string-filter";
import { CriteriaNumberFilter } from "@shared/domain/criteria/criteria-number-filter";
import { CriteriaDateFilter } from "@shared/domain/criteria/criteria-date-filter";
import { CriteriaBooleanFilter } from "@shared/domain/criteria/criteria-boolean-filter";
import { CriteriaFilterType } from "@shared/domain/constants/criteria-filter-type";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@shared/domain/constants/pagination";
import type { CriteriaRequest } from "../dto/criteria-request";
import type { CriteriaFilterRequest } from "../dto/criteria-filter-request";
import type { CriteriaOrderRequest } from "../dto/criteria-order-request";

interface Props<T extends string> {
  request: CriteriaRequest;
  criteria: Criteria<T>;
}

export type CriteriaFilterOption<T extends string> = {
  field: T;
  type: CriteriaFilterType;
};

/**
 * The first of the two translations: HTTP request in, criteria out.
 */
export abstract class CriteriaRequestMapper<T extends string> {
  abstract options(): CriteriaFilterOption<T>[];

  execute({ criteria, request }: Props<T>): Criteria<T> {
    if (request.search !== undefined) {
      criteria.setSearch(this.mapSearch(request.search));
    }

    // Pagination is always set, whether the request carries it or not: a criteria
    // with no pageSize translates into a query with no limit.
    criteria.setPage(this.mapPage(request.page));
    criteria.setPageSize(this.mapPageSize(request.pageSize));

    if (request.order !== undefined) {
      criteria.setOrder(this.mapOrder(request.order));
    }

    if (request.filters !== undefined) {
      const options = this.options();
      const result: CriteriaFilter[] = [];

      for (const filter of request.filters) {
        const mapped = this.mapFilter(filter, options);

        if (mapped !== null) {
          result.push(mapped);
        }
      }

      criteria.setFilters(result);
    }

    return criteria;
  }

  private mapOrder(v: CriteriaOrderRequest): CriteriaOrder {
    return new CriteriaOrder({ orderBy: v.by, orderType: v.type });
  }

  // An empty search is not a search for "": the free-text query would match on a
  // blank term and quietly return everything.
  private mapSearch(value: string): string | null {
    const trimmed = value.trim();

    return trimmed === "" ? null : trimmed;
  }

  private mapPage(value: number | undefined): number {
    if (value === undefined || !Number.isFinite(value)) {
      return 1;
    }

    return Math.max(Math.trunc(value), 1);
  }

  // The ceiling is what stops an absurd pageSize from becoming an unbounded query.
  private mapPageSize(value: number | undefined): number {
    if (value === undefined || !Number.isFinite(value)) {
      return DEFAULT_PAGE_SIZE;
    }

    return Math.min(Math.max(Math.trunc(value), 1), MAX_PAGE_SIZE);
  }

  /**
   * What is not declared in `options()` is dropped silently. The alternative — a 400
   * — is just as defensible; this way a URL saved months ago keeps returning
   * something sensible when a field stops being filterable.
   */
  private mapFilter(
    filter: CriteriaFilterRequest,
    options: CriteriaFilterOption<T>[],
  ): CriteriaFilter | null {
    const option = options.find((o) => o.field === filter.field);

    if (option === undefined) {
      return null;
    }

    const props = { field: option.field, operator: filter.operator };

    switch (option.type) {
      case CriteriaFilterType.STRING:
        return new CriteriaStringFilter({ ...props, values: filter.value });

      case CriteriaFilterType.NUMBER:
        return new CriteriaNumberFilter({
          ...props,
          values: this.mapNumbers(filter.value),
        });

      case CriteriaFilterType.DATE:
        return new CriteriaDateFilter({
          ...props,
          values: this.mapDates(filter.value),
        });

      case CriteriaFilterType.BOOLEAN: {
        const value = this.mapBoolean(filter.value);

        // Anything that was neither "true" nor "false" is no filter at all: read as
        // `false` it would restrict by something the client never asked for.
        if (value === null) {
          return null;
        }

        return new CriteriaBooleanFilter({ ...props, value: value });
      }

      default:
        return null;
    }
  }

  private mapNumbers(values: string[]): number[] {
    const result: number[] = [];

    for (const value of values) {
      if (value.trim() === "") {
        continue;
      }

      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        result.push(parsed);
      }
    }

    return result;
  }

  private mapDates(values: string[]): Date[] {
    const result: Date[] = [];

    for (const value of values) {
      const parsed = new Date(value);

      if (!Number.isNaN(parsed.getTime())) {
        result.push(parsed);
      }
    }

    return result;
  }

  private mapBoolean(values: string[]): boolean | null {
    for (const value of values) {
      const parsed = value.trim().toLowerCase();

      if (parsed === "true") {
        return true;
      }

      if (parsed === "false") {
        return false;
      }
    }

    return null;
  }
}

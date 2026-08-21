import { FilterQuery } from "mongoose";
import { Criteria } from "@shared/domain/criteria/criteria";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import {
  MongoCriteriaFilterMapper,
  escapeRegex,
} from "./mongo-criteria-filter-mapper";

export type MongoCriteriaField<T extends string> = {
  field: T;
  mongo: string;
  canSearch: boolean;
};

interface Props<T extends string> {
  criteria: Criteria<T>;
  fields: MongoCriteriaField<T>[];
}

/**
 * Note what this returns: pieces, not a built query. Who uses them and in which order
 * is the repository's decision — which is what lets the same builder feed a `find()`
 * and an `aggregate()` with a `$lookup` before the `$match`.
 */
export type MongoCriteriaResult = {
  filter: FilterQuery<unknown>;
  order: Record<string, 1 | -1> | null;
  skip: number | null;
  limit: number | null;
};

export class MongoCriteriaBuilder<T extends string> {
  private readonly filterMapper = new MongoCriteriaFilterMapper();

  execute({ criteria, fields }: Props<T>): MongoCriteriaResult {
    const result: MongoCriteriaResult = {
      filter: {},
      order: null,
      skip: null,
      limit: null,
    };

    // Each field can contribute several fragments —one per operator— so they are
    // flattened: `$and` is a list of conditions, not a list of lists.
    const fragments = fields.flatMap((f) =>
      this.filterMapper.execute({
        name: f.mongo,
        filters: criteria.find(f.field),
      }),
    );

    if (fragments.length > 0) {
      result.filter.$and = fragments;
    }

    if (criteria.search !== null) {
      const value = criteria.search;

      const search = fields
        .filter((f) => f.canSearch)
        // the text comes from a search box and `$regex` interprets it: escape it
        .map((f) => ({
          [f.mongo]: { $regex: escapeRegex(value), $options: "i" },
        }));

      if (search.length > 0) {
        result.filter.$or = search;
      }
    }

    const order = criteria.order;

    if (order !== null && order.hasOrder()) {
      // Sorting resolves against the same map as the filters, so a field that is not
      // in it cannot be sorted by either.
      const found = fields.find((f) => f.field === order.orderBy);

      if (found !== undefined) {
        const direction = order.orderType === CriteriaOrderType.ASC ? 1 : -1;

        result.order = { [found.mongo]: direction };
      }
    }

    if (criteria.pageSize !== null) {
      const page = criteria.page ?? 1;

      result.skip = (page - 1) * criteria.pageSize;
      result.limit = criteria.pageSize;
    }

    return result;
  }
}

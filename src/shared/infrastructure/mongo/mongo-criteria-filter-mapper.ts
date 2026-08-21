import { FilterQuery } from "mongoose";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaFilter } from "@shared/domain/criteria/criteria-filter";
import { CriteriaStringFilter } from "@shared/domain/criteria/criteria-string-filter";
import { CriteriaNumberFilter } from "@shared/domain/criteria/criteria-number-filter";
import { CriteriaDateFilter } from "@shared/domain/criteria/criteria-date-filter";
import { CriteriaBooleanFilter } from "@shared/domain/criteria/criteria-boolean-filter";

// The filters arrive already resolved: which field each one belongs to is decided by
// the builder, the only piece that knows the criteria and its field enum.
interface Props {
  filters: CriteriaFilter[];
  name: string;
}

export class MongoCriteriaFilterMapper {
  execute({ filters, name }: Props): FilterQuery<unknown>[] {
    const result: FilterQuery<unknown>[] = [];

    for (const filter of filters) {
      if (!filter.hasValues()) {
        continue;
      }

      let save: FilterQuery<unknown> | null = null;

      if (filter instanceof CriteriaStringFilter) {
        save = this.mapString(name, filter);
      }

      if (filter instanceof CriteriaNumberFilter) {
        save = this.mapNumber(name, filter);
      }

      if (filter instanceof CriteriaDateFilter) {
        save = this.mapDate(name, filter);
      }

      if (filter instanceof CriteriaBooleanFilter) {
        save = this.mapBoolean(name, filter);
      }

      if (save !== null) {
        result.push(save);
      }
    }

    return result;
  }

  private mapString(
    name: string,
    filter: CriteriaStringFilter,
  ): FilterQuery<unknown> | null {
    const values = filter.strings();
    const [first] = values;
    const single = values.length === 1;

    switch (filter.operator) {
      case CriteriaFilterOperator.EQUAL:
        return { [name]: single ? first : { $in: values } };

      case CriteriaFilterOperator.NOT_EQUAL:
        return { [name]: single ? { $ne: first } : { $nin: values } };

      // Comparison operators are binary: with several values only the first one
      // means anything.
      case CriteriaFilterOperator.GT:
        return { [name]: { $gt: first } };

      case CriteriaFilterOperator.GTE:
        return { [name]: { $gte: first } };

      case CriteriaFilterOperator.LT:
        return { [name]: { $lt: first } };

      case CriteriaFilterOperator.LTE:
        return { [name]: { $lte: first } };

      case CriteriaFilterOperator.CONTAINS: {
        // The value comes from the client: unescaped it could inject regex
        // metacharacters, or a catastrophically backtracking pattern.
        const regex = values.map((v) => new RegExp(escapeRegex(v), "i"));

        return { [name]: single ? regex[0] : { $in: regex } };
      }

      case CriteriaFilterOperator.IN:
        return { [name]: { $in: values } };

      default:
        return null;
    }
  }

  private mapNumber(
    name: string,
    filter: CriteriaNumberFilter,
  ): FilterQuery<unknown> | null {
    const values = filter.numbers();
    const [first] = values;
    const single = values.length === 1;

    switch (filter.operator) {
      case CriteriaFilterOperator.EQUAL:
        return { [name]: single ? first : { $in: values } };

      case CriteriaFilterOperator.NOT_EQUAL:
        return { [name]: single ? { $ne: first } : { $nin: values } };

      case CriteriaFilterOperator.GT:
        return { [name]: { $gt: first } };

      case CriteriaFilterOperator.GTE:
        return { [name]: { $gte: first } };

      case CriteriaFilterOperator.LT:
        return { [name]: { $lt: first } };

      case CriteriaFilterOperator.LTE:
        return { [name]: { $lte: first } };

      case CriteriaFilterOperator.IN:
        return { [name]: { $in: values } };

      default:
        return null;
    }
  }

  private mapDate(
    name: string,
    filter: CriteriaDateFilter,
  ): FilterQuery<unknown> | null {
    const values = filter.dates();
    const [first] = values;
    const single = values.length === 1;

    switch (filter.operator) {
      case CriteriaFilterOperator.EQUAL:
        return { [name]: single ? first : { $in: values } };

      case CriteriaFilterOperator.NOT_EQUAL:
        return { [name]: single ? { $ne: first } : { $nin: values } };

      case CriteriaFilterOperator.GT:
        return { [name]: { $gt: first } };

      case CriteriaFilterOperator.GTE:
        return { [name]: { $gte: first } };

      case CriteriaFilterOperator.LT:
        return { [name]: { $lt: first } };

      case CriteriaFilterOperator.LTE:
        return { [name]: { $lte: first } };

      case CriteriaFilterOperator.IN:
        return { [name]: { $in: values } };

      default:
        return null;
    }
  }

  private mapBoolean(
    name: string,
    filter: CriteriaBooleanFilter,
  ): FilterQuery<unknown> | null {
    // A boolean is not sorted nor searched by text: the comparison operators and
    // CONTAINS fall through to the default and do not filter at all.
    switch (filter.operator) {
      case CriteriaFilterOperator.EQUAL:
      case CriteriaFilterOperator.IN:
        return { [name]: filter.value };

      case CriteriaFilterOperator.NOT_EQUAL:
        return { [name]: { $ne: filter.value } };

      default:
        return null;
    }
  }
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

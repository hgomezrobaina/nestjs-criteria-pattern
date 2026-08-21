import {
  Equal,
  FindOperator,
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from "typeorm";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaFilter } from "@shared/domain/criteria/criteria-filter";
import { CriteriaStringFilter } from "@shared/domain/criteria/criteria-string-filter";
import { CriteriaNumberFilter } from "@shared/domain/criteria/criteria-number-filter";
import { CriteriaDateFilter } from "@shared/domain/criteria/criteria-date-filter";
import { CriteriaBooleanFilter } from "@shared/domain/criteria/criteria-boolean-filter";

/**
 * The same switch as the Mongo one with a different vocabulary. Everything that is
 * engine-specific about this project lives in this file and in the builder next to it.
 */
export class TypeOrmCriteriaOperatorMapper {
  execute(filter: CriteriaFilter): FindOperator<unknown> | null {
    if (filter instanceof CriteriaStringFilter) {
      return this.mapString(filter);
    }

    if (filter instanceof CriteriaNumberFilter) {
      return this.mapComparable(filter.operator, filter.numbers());
    }

    if (filter instanceof CriteriaDateFilter) {
      return this.mapComparable(filter.operator, filter.dates());
    }

    if (filter instanceof CriteriaBooleanFilter) {
      return this.mapBoolean(filter);
    }

    return null;
  }

  /**
   * ILike is emitted as native ILIKE only on postgres and cockroachdb; every other
   * driver gets UPPER(column) LIKE UPPER(parameter), which behaves the same and needs
   * a functional index to perform the same.
   */
  contains(value: string): FindOperator<unknown> {
    return ILike(`%${value}%`) as FindOperator<unknown>;
  }

  private mapString(filter: CriteriaStringFilter): FindOperator<unknown> | null {
    const values = filter.strings();
    const [first] = values;

    if (filter.operator === CriteriaFilterOperator.CONTAINS) {
      return this.contains(first);
    }

    return this.mapComparable(filter.operator, values);
  }

  private mapComparable<V>(
    operator: CriteriaFilterOperator,
    values: V[],
  ): FindOperator<unknown> | null {
    const [first] = values;
    const single = values.length === 1;

    switch (operator) {
      case CriteriaFilterOperator.EQUAL:
        return (single ? Equal(first) : In(values)) as FindOperator<unknown>;

      case CriteriaFilterOperator.NOT_EQUAL:
        return (
          single ? Not(Equal(first)) : Not(In(values))
        ) as FindOperator<unknown>;

      case CriteriaFilterOperator.GT:
        return MoreThan(first) as FindOperator<unknown>;

      case CriteriaFilterOperator.GTE:
        return MoreThanOrEqual(first) as FindOperator<unknown>;

      case CriteriaFilterOperator.LT:
        return LessThan(first) as FindOperator<unknown>;

      case CriteriaFilterOperator.LTE:
        return LessThanOrEqual(first) as FindOperator<unknown>;

      case CriteriaFilterOperator.IN:
        return In(values) as FindOperator<unknown>;

      default:
        return null;
    }
  }

  private mapBoolean(
    filter: CriteriaBooleanFilter,
  ): FindOperator<unknown> | null {
    switch (filter.operator) {
      case CriteriaFilterOperator.EQUAL:
      case CriteriaFilterOperator.IN:
        return Equal(filter.value) as FindOperator<unknown>;

      case CriteriaFilterOperator.NOT_EQUAL:
        return Not(Equal(filter.value)) as FindOperator<unknown>;

      default:
        return null;
    }
  }
}

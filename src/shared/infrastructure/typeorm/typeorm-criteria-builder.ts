import { And, FindOperator } from "typeorm";
import { Criteria } from "@shared/domain/criteria/criteria";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import { TypeOrmCriteriaOperatorMapper } from "./typeorm-criteria-operator-mapper";

export type TypeOrmCriteriaField<T extends string> = {
  field: T;
  column: string;
  canSearch: boolean;
};

interface Props<T extends string> {
  criteria: Criteria<T>;
  fields: TypeOrmCriteriaField<T>[];
}

type Nested = Record<string, unknown>;

export type TypeOrmCriteriaResult = {
  where: Nested | Nested[];
  order: Nested | undefined;
  skip: number | undefined;
  take: number | undefined;
};

/**
 * The SQL twin of MongoCriteriaBuilder. Same input, same shape of output: the pieces
 * of a query, not a query. Porting a whole list from Mongo to SQL is this file plus a
 * field map — the enum, the criteria, the DTO, the request mapper and the use case do
 * not change.
 */
export class TypeOrmCriteriaBuilder<T extends string> {
  private readonly operatorMapper = new TypeOrmCriteriaOperatorMapper();

  execute({ criteria, fields }: Props<T>): TypeOrmCriteriaResult {
    const where: Nested = {};

    for (const f of fields) {
      const operators = criteria
        .find(f.field)
        .filter((filter) => filter.hasValues())
        .map((filter) => this.operatorMapper.execute(filter))
        .filter((op): op is FindOperator<unknown> => op !== null);

      if (operators.length === 0) {
        continue;
      }

      // Two filters over the same field are an interval, and TypeORM combines them
      // with And(): the equivalent of the two `$and` fragments in Mongo.
      const condition =
        operators.length === 1 ? operators[0] : And(...operators);

      // `author.name` becomes `{ author: { name: ... } }`: TypeORM nests the where by
      // relation and does not take a dotted path as a key.
      assign(where, f.column.split("."), condition);
    }

    const pageSize = criteria.pageSize;

    return {
      where: this.mapSearch(criteria, fields, where),
      order: this.mapOrder(criteria, fields),
      skip: pageSize === null ? undefined : ((criteria.page ?? 1) - 1) * pageSize,
      take: pageSize ?? undefined,
    };
  }

  /**
   * Free-text search is an OR, and in TypeORM an OR at the top level is an array of
   * wheres — so the shared conditions have to be repeated in every branch.
   */
  private mapSearch(
    criteria: Criteria<T>,
    fields: TypeOrmCriteriaField<T>[],
    where: Nested,
  ): Nested | Nested[] {
    if (criteria.search === null) {
      return where;
    }

    const value = criteria.search;

    const branches = fields
      .filter((f) => f.canSearch)
      .map((f) => {
        const branch: Nested = structuredClone(where);

        assign(
          branch,
          f.column.split("."),
          this.operatorMapper.contains(value),
        );

        return branch;
      });

    return branches.length > 0 ? branches : where;
  }

  private mapOrder(
    criteria: Criteria<T>,
    fields: TypeOrmCriteriaField<T>[],
  ): Nested | undefined {
    const order = criteria.order;

    if (order === null || !order.hasOrder()) {
      return undefined;
    }

    const found = fields.find((f) => f.field === order.orderBy);

    if (found === undefined) {
      return undefined;
    }

    const result: Nested = {};

    assign(
      result,
      found.column.split("."),
      order.orderType === CriteriaOrderType.ASC ? "ASC" : "DESC",
    );

    return result;
  }
}

/** Writes `value` at a nested path, creating the intermediate objects. */
function assign(target: Nested, path: string[], value: unknown): void {
  let current = target;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];

    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }

    current = current[key] as Nested;
  }

  current[path[path.length - 1]] = value;
}

import { CriteriaFilterOperator } from "../constants/criteria-filter-operator";

export type CriteriaFilterProps = {
  field: string;
  operator: CriteriaFilterOperator;
};

export abstract class CriteriaFilter {
  readonly field: string;
  readonly operator: CriteriaFilterOperator;

  constructor({ field, operator }: CriteriaFilterProps) {
    this.field = field;
    this.operator = operator;
  }

  abstract hasValues(): boolean;
}

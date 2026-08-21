import { CriteriaFilter, CriteriaFilterProps } from "./criteria-filter";

type Props = CriteriaFilterProps & { values: number[] };

export class CriteriaNumberFilter extends CriteriaFilter {
  readonly values: number[];

  constructor(props: Props) {
    super(props);

    this.values = props.values;
  }

  numbers(): number[] {
    return this.values;
  }

  // A filter with no values must not restrict the query.
  hasValues(): boolean {
    return this.numbers().length > 0;
  }
}

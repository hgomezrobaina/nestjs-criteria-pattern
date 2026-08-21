import { CriteriaFilter, CriteriaFilterProps } from "./criteria-filter";

type Props = CriteriaFilterProps & { values: Date[] };

export class CriteriaDateFilter extends CriteriaFilter {
  readonly values: Date[];

  constructor(props: Props) {
    super(props);

    this.values = props.values;
  }

  dates(): Date[] {
    return this.values;
  }

  // A filter with no values must not restrict the query.
  hasValues(): boolean {
    return this.dates().length > 0;
  }
}

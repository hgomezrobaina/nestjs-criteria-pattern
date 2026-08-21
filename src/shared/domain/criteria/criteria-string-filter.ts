import { CriteriaFilter, CriteriaFilterProps } from "./criteria-filter";

type Props = CriteriaFilterProps & { values: string[] };

export class CriteriaStringFilter extends CriteriaFilter {
  readonly values: string[];

  constructor(props: Props) {
    super(props);

    this.values = props.values;
  }

  strings(): string[] {
    return this.values;
  }

  // A filter with no values must not restrict the query.
  hasValues(): boolean {
    return this.strings().length > 0;
  }
}

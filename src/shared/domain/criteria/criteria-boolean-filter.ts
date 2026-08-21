import { CriteriaFilter, CriteriaFilterProps } from "./criteria-filter";

type Props = CriteriaFilterProps & { value: boolean };

export class CriteriaBooleanFilter extends CriteriaFilter {
  readonly value: boolean;

  constructor(props: Props) {
    super(props);

    this.value = props.value;
  }

  // A boolean filter always carries exactly one value: it is built only when the
  // incoming text was "true" or "false", so by the time it exists it restricts.
  hasValues(): boolean {
    return true;
  }
}

import { CriteriaOrderType } from "../constants/criteria-order-type";

interface Props {
  orderBy: string;
  orderType: CriteriaOrderType;
}

export class CriteriaOrder {
  readonly orderBy: string;
  readonly orderType: CriteriaOrderType;

  constructor({ orderBy, orderType }: Props) {
    this.orderBy = orderBy;
    this.orderType = orderType;
  }

  hasOrder(): boolean {
    return this.orderType !== CriteriaOrderType.NONE;
  }
}

import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";

export class CriteriaOrderRequest {
  @IsString()
  @IsNotEmpty()
  by!: string;

  @IsEnum(CriteriaOrderType)
  type!: CriteriaOrderType;
}

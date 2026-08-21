import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { CriteriaFilterRequest } from "./criteria-filter-request";
import { CriteriaOrderRequest } from "./criteria-order-request";

/**
 * The only file of the pattern carrying decorators. The concentration is deliberate:
 * this is the border everything uncontrolled comes through.
 */
export class CriteriaRequest {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaFilterRequest)
  filters?: CriteriaFilterRequest[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CriteriaOrderRequest)
  order?: CriteriaOrderRequest;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

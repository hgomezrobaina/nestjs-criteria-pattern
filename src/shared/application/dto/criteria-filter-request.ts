import { Transform } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";

export class CriteriaFilterRequest {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsEnum(CriteriaFilterOperator)
  operator!: CriteriaFilterOperator;

  // qs returns a string when the query carries `value=x` once, and an array when it
  // carries indexes (`value[0]=x`); normalised so the translator does not have to
  // depend on how many values the client happened to send.
  @IsDefined()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  value!: string[];
}

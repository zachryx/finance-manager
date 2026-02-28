import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class ForecastingInput {
  @Field(() => Int, { defaultValue: 90 })
  @IsOptional()
  days?: number;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  includeTrends?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  includeAllScenarios?: boolean;
}

@InputType()
export class WhatIfInput {
  @Field(() => String)
  scenarioName: string;

  @Field(() => Number)
  incomeChange: number;

  @Field(() => Number)
  expenseChange: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description?: string;
}

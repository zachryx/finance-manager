import { InputType, Field, Int, registerEnumType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

export enum ScenarioType {
  OPTIMISTIC = "OPTIMISTIC",
  REALISTIC = "REALISTIC",
  PESSIMISTIC = "PESSIMISTIC",
}

registerEnumType(ScenarioType, {
  name: "ScenarioType",
  description: "Cash flow projection scenario type",
});

@InputType()
export class CashFlowProjectionInput {
  @Field(() => Int, { defaultValue: 90 })
  @IsOptional()
  days?: number;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  includeRecurring?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  includeBudgets?: boolean;

  @Field(() => ScenarioType, { defaultValue: ScenarioType.REALISTIC })
  @IsOptional()
  scenario?: ScenarioType;
}

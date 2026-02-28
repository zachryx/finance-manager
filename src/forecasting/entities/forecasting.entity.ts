import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";

export enum ScenarioType {
  OPTIMISTIC = "OPTIMISTIC",
  REALISTIC = "REALISTIC",
  PESSIMISTIC = "PESSIMISTIC",
}

registerEnumType(ScenarioType, {
  name: "ForecastingScenarioType",
  description: "Type of forecasting scenario",
});

@ObjectType()
export class ScenarioProjection {
  @Field(() => String)
  scenario: string;

  @Field(() => Float)
  projectedIncome: number;

  @Field(() => Float)
  projectedExpenses: number;

  @Field(() => Float)
  projectedSavings: number;

  @Field(() => Float)
  confidenceLevel: number;

  @Field(() => [String])
  assumptions: string[];
}

@ObjectType()
export class ForecastTrend {
  @Field(() => String)
  metric: string;

  @Field(() => Float)
  currentValue: number;

  @Field(() => Float)
  projectedValue: number;

  @Field(() => Float)
  changePercent: number;

  @Field(() => String)
  trend: string;
}

@ObjectType()
export class ForecastingResult {
  @Field(() => String)
  period: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => [ScenarioProjection])
  scenarios: ScenarioProjection[];

  @Field(() => [ForecastTrend])
  trends: ForecastTrend[];

  @Field(() => Date)
  generatedAt: Date;
}

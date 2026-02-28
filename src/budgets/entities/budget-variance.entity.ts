import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";

export enum VarianceType {
  FAVORABLE = "FAVORABLE",
  UNFAVORABLE = "UNFAVORABLE",
  ON_TARGET = "ON_TARGET",
}

export enum TrendDirection {
  IMPROVING = "IMPROVING",
  WORSENING = "WORSENING",
  STABLE = "STABLE",
}

registerEnumType(VarianceType, {
  name: "VarianceType",
  description: "Type of variance",
});

registerEnumType(TrendDirection, {
  name: "TrendDirection",
  description: "Direction of variance trend",
});

@ObjectType()
export class PeriodVariance {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  actual: number;

  @Field(() => Float)
  budgeted: number;

  @Field(() => Float)
  variance: number;
}

@ObjectType()
export class VarianceTrend {
  @Field(() => TrendDirection)
  direction: TrendDirection;

  @Field(() => Float)
  magnitude: number;

  @Field(() => [PeriodVariance])
  periods: PeriodVariance[];
}

@ObjectType()
export class BudgetVariance {
  @Field(() => String)
  budgetId: string;

  @Field(() => Float)
  actualSpending: number;

  @Field(() => Float)
  budgetedAmount: number;

  @Field(() => Float)
  variance: number;

  @Field(() => Float)
  variancePercent: number;

  @Field(() => VarianceType)
  varianceType: VarianceType;

  @Field(() => Boolean)
  isSignificant: boolean;

  @Field(() => Float)
  threshold: number;

  @Field(() => VarianceTrend, { nullable: true })
  trend: VarianceTrend | null;
}

import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";

export enum FactorType {
  KNOWN_INCOME = "KNOWN_INCOME",
  KNOWN_EXPENSE = "KNOWN_EXPENSE",
  BUDGETED_EXPENSE = "BUDGETED_EXPENSE",
  HISTORICAL_PATTERN = "HISTORICAL_PATTERN",
  ESTIMATE = "ESTIMATE",
}

registerEnumType(FactorType, {
  name: "FactorType",
  description: "Type of projection factor",
});

@ObjectType()
export class ProjectionFactor {
  @Field(() => FactorType)
  type: FactorType;

  @Field(() => String)
  description: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  confidence: number;
}

@ObjectType()
export class CashFlowPoint {
  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  projectedBalance: number;

  @Field(() => Float)
  projectedIncome: number;

  @Field(() => Float)
  projectedExpenses: number;

  @Field(() => Float)
  confidence: number;

  @Field(() => [ProjectionFactor])
  factors: ProjectionFactor[];
}

@ObjectType()
export class CashFlowSummary {
  @Field(() => Float)
  totalProjectedIncome: number;

  @Field(() => Float)
  totalProjectedExpenses: number;

  @Field(() => Float)
  netCashFlow: number;

  @Field(() => Float)
  endingBalance: number;

  @Field(() => Number, { nullable: true })
  daysUntilNegative: number | null;

  @Field(() => String)
  riskLevel: string;
}

import { ObjectType, Field, Int, Float } from "@nestjs/graphql";

@ObjectType()
export class BudgetSummary {
  @Field(() => Int)
  totalBudgets: number;

  @Field(() => Int)
  onTrack: number;

  @Field(() => Int)
  atRisk: number;

  @Field(() => Int)
  overBudget: number;

  @Field(() => Float)
  totalBudgeted: number;

  @Field(() => Float)
  totalActual: number;

  @Field(() => Float)
  totalVariance: number;

  @Field(() => Float)
  averageUtilization: number;
}

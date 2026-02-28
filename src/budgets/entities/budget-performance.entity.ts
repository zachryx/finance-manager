import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";
import { Budget } from "./budget.entity";
import { Expense } from "../../expenses/entities/expense.entity";

export enum BudgetStatus {
  ON_TRACK = "ON_TRACK",
  AT_RISK = "AT_RISK",
  OVER_BUDGET = "OVER_BUDGET",
  NOT_STARTED = "NOT_STARTED",
}

registerEnumType(BudgetStatus, {
  name: "BudgetStatus",
  description: "Budget status based on utilization",
});

@ObjectType()
export class DateRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@ObjectType()
export class BudgetVsActual {
  @Field(() => Budget)
  budget: Budget;

  @Field(() => Float)
  actualSpending: number;

  @Field(() => Float)
  budgetedAmount: number;

  @Field(() => Float)
  variance: number;

  @Field(() => Float)
  variancePercent: number;

  @Field(() => Float)
  remaining: number;

  @Field(() => Float)
  utilizationPercent: number;

  @Field(() => BudgetStatus)
  status: BudgetStatus;

  @Field(() => DateRange)
  period: DateRange;

  @Field(() => [Expense])
  expenses: Expense[];

  @Field(() => Number)
  expenseCount: number;

  @Field(() => Float, { nullable: true })
  projectedSpending: number | null;

  @Field(() => Number, { nullable: true })
  daysRemaining: number | null;
}

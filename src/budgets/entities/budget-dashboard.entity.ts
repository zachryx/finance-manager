import { ObjectType, Field } from "@nestjs/graphql";
import { BudgetSummary } from "./budget-summary.entity";
import { BudgetAlert } from "./budget-alert.entity";
import { BudgetVsActual } from "./budget-performance.entity";

@ObjectType()
export class BudgetDashboard {
  @Field(() => BudgetSummary)
  summary: BudgetSummary;

  @Field(() => [BudgetVsActual])
  budgets: BudgetVsActual[];

  @Field(() => [BudgetAlert])
  alerts: BudgetAlert[];

  @Field(() => Date)
  lastUpdated: Date;
}

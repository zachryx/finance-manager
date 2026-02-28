import { ObjectType, Field, Float, Int } from "@nestjs/graphql";

@ObjectType()
export class KpiMetric {
  @Field(() => String)
  name: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  changePercent: number;

  @Field(() => String)
  trend: string;
}

@ObjectType()
export class FinancialSummary {
  @Field(() => Float)
  totalIncome: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  netSavings: number;

  @Field(() => Float)
  savingsRate: number;

  @Field(() => Float)
  totalBudget: number;

  @Field(() => Float)
  budgetUtilization: number;
}

@ObjectType()
export class AccountSummary {
  @Field(() => String)
  accountId: string;

  @Field(() => String)
  accountName: string;

  @Field(() => Float)
  balance: number;

  @Field(() => Float)
  change: number;
}

@ObjectType()
export class ExecutiveDashboard {
  @Field(() => [KpiMetric])
  kpis: KpiMetric[];

  @Field(() => FinancialSummary)
  summary: FinancialSummary;

  @Field(() => [AccountSummary])
  accounts: AccountSummary[];

  @Field(() => Date)
  lastUpdated: Date;
}

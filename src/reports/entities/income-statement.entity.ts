import { ObjectType, Field, Float } from "@nestjs/graphql";

@ObjectType()
export class IncomeEntry {
  @Field(() => String)
  source: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class ExpenseEntry {
  @Field(() => String)
  category: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class IncomeStatement {
  @Field(() => String)
  period: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Float)
  totalIncome: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  netIncome: number;

  @Field(() => [IncomeEntry])
  incomeBreakdown: IncomeEntry[];

  @Field(() => [ExpenseEntry])
  expenseBreakdown: ExpenseEntry[];
}

import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";
import { ExpenseCategory } from "@prisma/client";

registerEnumType(ExpenseCategory, {
  name: "ExpenseCategory",
  description: "Expense category type",
});

@ObjectType()
export class CategoryData {
  @Field(() => String)
  category: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  percentage: number;

  @Field(() => Float)
  count: number;

  @Field(() => Float)
  average: number;
}

@ObjectType()
export class CategoryTrend {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  amount: number;
}

@ObjectType()
export class CategoryBreakdown {
  @Field(() => String)
  period: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => [CategoryData])
  categories: CategoryData[];

  @Field(() => [CategoryTrend])
  trends: CategoryTrend[];
}

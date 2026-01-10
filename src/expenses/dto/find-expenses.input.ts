import { Field, InputType, Int, registerEnumType } from "@nestjs/graphql";
import { ExpenseCategory } from "@prisma/client";

registerEnumType(ExpenseCategory, {
  name: "ExpenseCategory",
  description: "Expense category type",
});

@InputType()
export class FindExpensesInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => String, { nullable: true })
  accountId: string;

  @Field(() => ExpenseCategory)
  category: ExpenseCategory;
}

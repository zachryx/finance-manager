import { ObjectType, Field, Int, Float, registerEnumType } from "@nestjs/graphql";
import { ExpenseCategory } from "@prisma/client";

registerEnumType(ExpenseCategory, {
  name: "ExpenseCategory",
  description: "Expense category type",
});

@ObjectType()
export class Expense {
  @Field(() => String)
  id: String;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Float)
  amount: number;

  @Field(() => ExpenseCategory)
  category: ExpenseCategory;

  @Field(() => String)
  userId: string;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date)
  updated_at: Date;
}

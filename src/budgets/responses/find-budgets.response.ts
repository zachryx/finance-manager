import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Budget } from "../entities/budget.entity";

@ObjectType()
export class FindBudgetsResponse {
  @Field(() => [Budget])
  data: Budget[];

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalCount: number;
}

import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class BudgetDashboardInput {
  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  limit?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  page?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  status?: string;
}

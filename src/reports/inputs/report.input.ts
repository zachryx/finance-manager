import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class ReportInput {
  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
}

@InputType()
export class DashboardInput {
  @Field(() => Int, { defaultValue: 30 })
  @IsOptional()
  days?: number;
}

@InputType()
export class CategoryBreakdownInput {
  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  category?: string;
}

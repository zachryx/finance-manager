import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class SubmitApprovalInput {
  @Field(() => String)
  type: string;

  @Field(() => String)
  referenceId: string;

  @Field(() => Number)
  amount: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description?: string;
}

@InputType()
export class ApproveInput {
  @Field(() => String)
  approvalId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  comments?: string;
}

@InputType()
export class ApprovalFilterInput {
  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  limit?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  page?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  type?: string;
}

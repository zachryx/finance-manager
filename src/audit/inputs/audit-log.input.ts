import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class AuditLogFilterInput {
  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  limit?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  page?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  entityType?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  entityId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  action?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  userId?: string;
}

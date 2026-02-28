import { ObjectType, Field, Int } from "@nestjs/graphql";
import { AuditLog } from "../entities/audit-log.entity";

@ObjectType()
export class AuditLogsResponse {
  @Field(() => [AuditLog])
  data: AuditLog[];

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalCount: number;
}

import { ObjectType, Field, Int } from "@nestjs/graphql";
import { ApprovalRequest } from "../entities/approval-request.entity";

@ObjectType()
export class ApprovalsResponse {
  @Field(() => [ApprovalRequest])
  data: ApprovalRequest[];

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalCount: number;
}

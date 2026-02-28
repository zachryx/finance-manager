import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";
import {
  ApprovalType as PrismaApprovalType,
  ApprovalStatus as PrismaApprovalStatus,
} from "../../generated/prisma/index";

export enum ApprovalType {
  EXPENSE = "EXPENSE",
  BUDGET = "BUDGET",
  INCOME = "INCOME",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

registerEnumType(ApprovalType, {
  name: "ApprovalType",
  description: "Type of approval request",
});

registerEnumType(ApprovalStatus, {
  name: "ApprovalStatus",
  description: "Status of approval request",
});

@ObjectType()
export class ApprovalRequest {
  @Field(() => String)
  id: string;

  @Field(() => ApprovalType)
  type: ApprovalType;

  @Field(() => String)
  referenceId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String)
  requestedBy: string;

  @Field(() => String, { nullable: true })
  approverId: string | null;

  @Field(() => String, { nullable: true })
  comments: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  resolvedAt: Date | null;
}

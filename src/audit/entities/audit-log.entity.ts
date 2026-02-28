import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

registerEnumType(AuditAction, {
  name: "AuditAction",
  description: "Type of audit action",
});

@ObjectType()
export class AuditLog {
  @Field(() => String)
  id: string;

  @Field(() => String)
  entityType: string;

  @Field(() => String)
  entityId: string;

  @Field(() => AuditAction)
  action: AuditAction;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  previousValue: string | null;

  @Field(() => String, { nullable: true })
  newValue: string | null;

  @Field(() => String, { nullable: true })
  reason: string | null;

  @Field(() => String, { nullable: true })
  ipAddress: string | null;

  @Field(() => String, { nullable: true })
  userAgent: string | null;

  @Field(() => Date)
  createdAt: Date;
}

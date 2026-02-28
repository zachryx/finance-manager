import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";

export enum AlertType {
  LOW_CASH = "LOW_CASH",
  NEGATIVE_PROJECTION = "NEGATIVE_PROJECTION",
  LARGE_TRANSACTION = "LARGE_TRANSACTION",
  UNUSUAL_PATTERN = "UNUSUAL_PATTERN",
  THRESHOLD_BREACH = "THRESHOLD_BREACH",
}

export enum AlertSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

registerEnumType(AlertType, {
  name: "CashFlowAlertType",
  description: "Type of cash flow alert",
});

registerEnumType(AlertSeverity, {
  name: "CashFlowAlertSeverity",
  description: "Severity of the alert",
});

@ObjectType()
export class CashFlowAlert {
  @Field(() => AlertType)
  type: AlertType;

  @Field(() => String)
  message: string;

  @Field(() => AlertSeverity)
  severity: AlertSeverity;

  @Field(() => Date)
  date: Date;

  @Field(() => Date, { nullable: true })
  projectedDate: Date | null;

  @Field(() => String, { nullable: true })
  recommendation: string | null;
}

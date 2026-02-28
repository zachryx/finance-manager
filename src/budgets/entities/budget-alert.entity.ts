import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";

export enum AlertType {
  APPROACHING_LIMIT = "APPROACHING_LIMIT",
  OVER_BUDGET = "OVER_BUDGET",
  SIGNIFICANT_VARIANCE = "SIGNIFICANT_VARIANCE",
  PERIOD_ENDING = "PERIOD_ENDING",
}

export enum AlertSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

registerEnumType(AlertType, {
  name: "AlertType",
  description: "Type of budget alert",
});

registerEnumType(AlertSeverity, {
  name: "AlertSeverity",
  description: "Severity level of the alert",
});

@ObjectType()
export class BudgetAlert {
  @Field(() => String)
  budgetId: string;

  @Field(() => String)
  budgetName: string;

  @Field(() => AlertType)
  type: AlertType;

  @Field(() => String)
  message: string;

  @Field(() => AlertSeverity)
  severity: AlertSeverity;

  @Field(() => Date)
  createdAt: Date;
}

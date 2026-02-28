import { ObjectType, Field, Float, registerEnumType } from "@nestjs/graphql";

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

registerEnumType(RiskLevel, {
  name: "RiskLevel",
  description: "Cash flow risk level",
});

@ObjectType()
export class AccountCashPosition {
  @Field(() => String)
  accountId: string;

  @Field(() => String)
  accountName: string;

  @Field(() => Float)
  balance: number;

  @Field(() => String)
  currency: string;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class CurrencyCashPosition {
  @Field(() => String)
  currency: string;

  @Field(() => Float)
  total: number;

  @Field(() => [AccountCashPosition])
  accounts: AccountCashPosition[];
}

@ObjectType()
export class CashPosition {
  @Field(() => Float)
  totalCash: number;

  @Field(() => [AccountCashPosition])
  accounts: AccountCashPosition[];

  @Field(() => [CurrencyCashPosition])
  byCurrency: CurrencyCashPosition[];

  @Field(() => Date)
  lastUpdated: Date;
}

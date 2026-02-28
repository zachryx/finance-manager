import { ObjectType, Field } from "@nestjs/graphql";
import { CashFlowPoint } from "./cash-flow-projection.entity";
import { CashFlowSummary } from "./cash-flow-projection.entity";
import { CashFlowAlert } from "./cash-flow-alert.entity";

@ObjectType()
export class CashFlowProjection {
  @Field(() => Number)
  currentBalance: number;

  @Field(() => [CashFlowPoint])
  projections: CashFlowPoint[];

  @Field(() => CashFlowSummary)
  summary: CashFlowSummary;

  @Field(() => [CashFlowAlert])
  alerts: CashFlowAlert[];
}

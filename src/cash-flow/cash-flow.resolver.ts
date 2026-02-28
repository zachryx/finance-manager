import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql.-auth.guard";
import { CurrentUser } from "../common/decorators/current-user";
import { User } from "../users/entities/user.entity";
import { CashFlowService } from "./cash-flow.service";
import { CashPosition } from "./entities/cash-position.entity";
import { CashFlowProjection } from "./entities/cash-flow.entity";
import { CashFlowProjectionInput } from "./inputs/cash-flow-projection.input";
import { CashFlowAlert } from "./entities/cash-flow-alert.entity";

@Resolver("CashFlow")
@UseGuards(GqlAuthGuard)
export class CashFlowResolver {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Query(() => CashPosition)
  async getCurrentCashPosition(@CurrentUser() user: User) {
    return this.cashFlowService.getCurrentCashPosition(user.id);
  }

  @Query(() => CashFlowProjection)
  async getProjectedCashFlow(
    @CurrentUser() user: User,
    @Args("input") input: CashFlowProjectionInput,
  ) {
    return this.cashFlowService.getProjectedCashFlow(user.id, input);
  }

  @Query(() => [CashFlowAlert])
  async getCashFlowAlerts(@CurrentUser() user: User) {
    return this.cashFlowService.getCashFlowAlerts(user.id);
  }
}

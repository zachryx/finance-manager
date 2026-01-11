import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql.-auth.guard";
import { CurrentUser } from "../common/decorators/current-user";
import { User } from "../users/entities/user.entity";
import { BudgetsService } from "./budgets.service";
import { Budget } from "./entities/budget.entity";
import { CreateBudgetInput } from "./inputs/create-budget.input";
import { FindBudgetsInput } from "./inputs/find-budgets.input";
import { UpdateBudgetInput } from "./inputs/update-budget.input";
import { FindBudgetsResponse } from "./responses/find-budgets.response";

@Resolver("Budget")
@UseGuards(GqlAuthGuard)
export class BudgetsResolver {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Query(() => FindBudgetsResponse)
  async getUserBudgets(
    @CurrentUser() user: User,
    @Args("findBudgetsInput") findBudgetsInput: FindBudgetsInput
  ) {
    return this.budgetsService.handleGetBudgets(user.id, findBudgetsInput);
  }

  @Query(() => Budget)
  async getUserBudget(
    @CurrentUser() user: User,
    @Args("id", { type: () => String }) id: string
  ) {
    return this.budgetsService.handleGetBudget(id, user.id);
  }

  @Mutation(() => Budget)
  async createBudget(
    @CurrentUser() user: User,
    @Args("createBudgeInput") createBudgetInput: CreateBudgetInput
  ) {
    return this.budgetsService.handleCreateBudget(user.id, createBudgetInput);
  }

  @Mutation(() => Boolean)
  async deleteBudget(
    @CurrentUser() user: User,
    @Args("id", { type: () => String }) id: string
  ) {
    return this.budgetsService.handleDeleteBudget(id, user.id);
  }

  @Mutation(() => Budget)
  async updateBudget(
    @CurrentUser() user: User,
    @Args("updateBudgetInput") updateBudgetInput: UpdateBudgetInput
  ) {
    return this.budgetsService.handleUpdateBudget(
      updateBudgetInput.budgetId,
      user.id,
      updateBudgetInput
    );
  }
}

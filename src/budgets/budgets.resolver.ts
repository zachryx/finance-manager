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
import { BudgetDashboardInput } from "./inputs/budget-dashboard.input";
import { BudgetVsActual } from "./entities/budget-performance.entity";
import { BudgetDashboard } from "./entities/budget-dashboard.entity";
import { BudgetVariance } from "./entities/budget-variance.entity";

@Resolver("Budget")
@UseGuards(GqlAuthGuard)
export class BudgetsResolver {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Query(() => FindBudgetsResponse)
  async getUserBudgets(
    @CurrentUser() user: User,
    @Args("findBudgetsInput") findBudgetsInput: FindBudgetsInput,
  ) {
    return this.budgetsService.handleGetBudgets(user.id, findBudgetsInput);
  }

  @Query(() => Budget)
  async getUserBudget(
    @CurrentUser() user: User,
    @Args("id", { type: () => String }) id: string,
  ) {
    return this.budgetsService.handleGetBudget(id, user.id);
  }

  @Mutation(() => Budget)
  async createBudget(
    @CurrentUser() user: User,
    @Args("createBudgeInput") createBudgetInput: CreateBudgetInput,
  ) {
    return this.budgetsService.handleCreateBudget(user.id, createBudgetInput);
  }

  @Mutation(() => Boolean)
  async deleteBudget(
    @CurrentUser() user: User,
    @Args("id", { type: () => String }) id: string,
  ) {
    return this.budgetsService.handleDeleteBudget(id, user.id);
  }

  @Mutation(() => Budget)
  async updateBudget(
    @CurrentUser() user: User,
    @Args("updateBudgetInput") updateBudgetInput: UpdateBudgetInput,
  ) {
    return this.budgetsService.handleUpdateBudget(
      updateBudgetInput.budgetId,
      user.id,
      updateBudgetInput,
    );
  }

  @Query(() => BudgetVsActual)
  async getBudgetVsActual(
    @CurrentUser() user: User,
    @Args("budgetId", { type: () => String }) budgetId: string,
  ) {
    return this.budgetsService.getBudgetVsActual(budgetId, user.id);
  }

  @Query(() => BudgetVariance)
  async getBudgetVariance(
    @CurrentUser() user: User,
    @Args("budgetId", { type: () => String }) budgetId: string,
  ) {
    return this.budgetsService.getBudgetVariance(budgetId, user.id);
  }

  @Query(() => BudgetDashboard)
  async getBudgetDashboard(
    @CurrentUser() user: User,
    @Args("budgetDashboardInput") input: BudgetDashboardInput,
  ) {
    return this.budgetsService.getBudgetDashboard(user.id, input);
  }
}

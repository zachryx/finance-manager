import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql.-auth.guard";
import { CurrentUser } from "../common/decorators/current-user";
import { User } from "../users/entities/user.entity";
import { ReportsService } from "./reports.service";
import { ExecutiveDashboard } from "./entities/dashboard.entity";
import { IncomeStatement } from "./entities/income-statement.entity";
import { CategoryBreakdown } from "./entities/category-breakdown.entity";
import { ReportInput, DashboardInput } from "./inputs/report.input";

@Resolver("Reports")
@UseGuards(GqlAuthGuard)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => ExecutiveDashboard)
  async getExecutiveDashboard(
    @CurrentUser() user: User,
    @Args("input") input: DashboardInput,
  ) {
    return this.reportsService.getExecutiveDashboard(user.id, input);
  }

  @Query(() => IncomeStatement)
  async getIncomeStatement(
    @CurrentUser() user: User,
    @Args("input") input: ReportInput,
  ) {
    return this.reportsService.getIncomeStatement(user.id, input);
  }

  @Query(() => CategoryBreakdown)
  async getCategoryBreakdown(
    @CurrentUser() user: User,
    @Args("input") input: ReportInput,
  ) {
    return this.reportsService.getCategoryBreakdown(user.id, input);
  }
}

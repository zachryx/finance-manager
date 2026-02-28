import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import { CreateBudgetInput } from "./inputs/create-budget.input";
import { UpdateBudgetInput } from "./inputs/update-budget.input";
import { FindBudgetsInput } from "./inputs/find-budgets.input";
import { BudgetDashboardInput } from "./inputs/budget-dashboard.input";
import { Prisma, Budget, Range } from "@prisma/client";
import {
  BudgetVsActual,
  BudgetStatus,
  DateRange,
} from "./entities/budget-performance.entity";
import { BudgetSummary } from "./entities/budget-summary.entity";
import {
  BudgetAlert,
  AlertType,
  AlertSeverity,
} from "./entities/budget-alert.entity";
import { BudgetDashboard } from "./entities/budget-dashboard.entity";
import {
  BudgetVariance,
  VarianceType,
  TrendDirection,
  PeriodVariance,
  VarianceTrend,
} from "./entities/budget-variance.entity";

const SIGNIFICANT_VARIANCE_THRESHOLD = 10;
const AT_RISK_THRESHOLD = 80;
const APPROACHING_LIMIT_THRESHOLD = 50;

@Injectable()
export class BudgetsService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleCreateBudget(userId: string, data: CreateBudgetInput) {
    try {
      const budgetExists = await this.prismaService.budget.findFirst({
        where: {
          name: data.name,
          userId,
        },
      });

      if (budgetExists) {
        throw new InternalServerErrorException(
          "Budget with the same name already exists",
        );
      }

      const budget = await this.prismaService.budget.create({
        data: {
          ...data,
          userId,
        },
      });

      return budget;
    } catch (error) {
      throw new InternalServerErrorException("Failed to create budget");
    }
  }

  async handleGetBudget(id: string, userId: string) {
    try {
      const budget = await this.prismaService.budget.findFirst({
        where: { id, userId },
      });
      if (!budget) {
        throw new NotFoundException("Budget not found");
      }

      return budget;
    } catch (error) {
      throw new InternalServerErrorException("Failed to retrieve budget");
    }
  }

  async handleGetBudgets(userId: string, query: FindBudgetsInput) {
    try {
      const { page, limit, ...filters } = query;

      const whereClause: Prisma.BudgetWhereInput = { userId };

      if (filters.search) {
        whereClause.name = { contains: filters.search, mode: "insensitive" };
      }

      const skip = (page - 1) * limit;
      const take = limit;
      const [budgets, totalCount] = await Promise.all([
        this.prismaService.budget.findMany({
          where: whereClause,
          skip,
          take,
          orderBy: {
            created_at: "desc",
          },
        }),
        this.prismaService.budget.count({
          where: whereClause,
        }),
      ]);

      return {
        data: budgets,
        page,
        limit,
        totalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException("Failed to retrieve budgets");
    }
  }

  async handleDeleteBudget(id: string, userId: string) {
    try {
      const budget = await this.prismaService.budget.findFirst({
        where: { id, userId },
      });

      if (!budget) {
        throw new NotFoundException("Budget not found");
      }

      const deletedBudget = await this.prismaService.budget.delete({
        where: { id },
      });

      return !!deletedBudget;
    } catch (error) {
      throw new InternalServerErrorException("Failed to delete budget");
    }
  }

  async handleUpdateBudget(
    id: string,
    userId: string,
    data: Omit<UpdateBudgetInput, "budgetId">,
  ) {
    try {
      const budget = await this.prismaService.budget.findFirst({
        where: { id, userId },
      });

      if (!budget) {
        throw new NotFoundException("Budget not found");
      }

      const updatedBudget = await this.prismaService.budget.update({
        where: { id },
        data,
      });

      return updatedBudget;
    } catch (error) {
      throw new InternalServerErrorException("Failed to update budget");
    }
  }

  private calculateBudgetStatus(utilizationPercent: number): BudgetStatus {
    if (utilizationPercent === 0) return BudgetStatus.NOT_STARTED;
    if (utilizationPercent > 100) return BudgetStatus.OVER_BUDGET;
    if (utilizationPercent >= AT_RISK_THRESHOLD) return BudgetStatus.AT_RISK;
    return BudgetStatus.ON_TRACK;
  }

  private calculateDaysRemaining(endTime: Date): number {
    const now = new Date();
    const end = new Date(endTime);
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private calculateProjectedSpending(
    actualSpending: number,
    startTime: Date,
    endTime: Date,
  ): number | null {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now > end || now < start) return null;

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed =
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (daysElapsed === 0) return actualSpending;

    const dailyRate = actualSpending / daysElapsed;
    return Math.round(dailyRate * totalDays * 100) / 100;
  }

  async getBudgetVsActual(
    budgetId: string,
    userId: string,
  ): Promise<BudgetVsActual> {
    const budget = await this.prismaService.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw new NotFoundException("Budget not found");
    }

    const expenses = await this.prismaService.expense.findMany({
      where: {
        userId,
        created_at: {
          gte: budget.startTime,
          lte: budget.endTime,
        },
      },
      orderBy: { created_at: "desc" },
    });

    const actualSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetedAmount = budget.amount;
    const variance = actualSpending - budgetedAmount;
    const variancePercent =
      budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0;
    const remaining = budgetedAmount - actualSpending;
    const utilizationPercent =
      budgetedAmount > 0 ? (actualSpending / budgetedAmount) * 100 : 0;
    const status = this.calculateBudgetStatus(utilizationPercent);
    const daysRemaining = this.calculateDaysRemaining(budget.endTime);
    const projectedSpending = this.calculateProjectedSpending(
      actualSpending,
      budget.startTime,
      budget.endTime,
    );

    const period: DateRange = {
      start: budget.startTime,
      end: budget.endTime,
    };

    return {
      budget,
      actualSpending,
      budgetedAmount,
      variance,
      variancePercent: Math.round(variancePercent * 100) / 100,
      remaining,
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      status,
      period,
      expenses,
      expenseCount: expenses.length,
      projectedSpending,
      daysRemaining,
    };
  }

  async getBudgetVariance(
    budgetId: string,
    userId: string,
  ): Promise<BudgetVariance> {
    const budgetVsActual = await this.getBudgetVsActual(budgetId, userId);

    let varianceType: VarianceType;
    if (budgetVsActual.variancePercent > SIGNIFICANT_VARIANCE_THRESHOLD) {
      varianceType = VarianceType.UNFAVORABLE;
    } else if (
      budgetVsActual.variancePercent < -SIGNIFICANT_VARIANCE_THRESHOLD
    ) {
      varianceType = VarianceType.FAVORABLE;
    } else {
      varianceType = VarianceType.ON_TARGET;
    }

    return {
      budgetId: budgetVsActual.budget.id,
      actualSpending: budgetVsActual.actualSpending,
      budgetedAmount: budgetVsActual.budgetedAmount,
      variance: budgetVsActual.variance,
      variancePercent: budgetVsActual.variancePercent,
      varianceType,
      isSignificant:
        Math.abs(budgetVsActual.variancePercent) >=
        SIGNIFICANT_VARIANCE_THRESHOLD,
      threshold: SIGNIFICANT_VARIANCE_THRESHOLD,
      trend: null,
    };
  }

  private generateBudgetAlerts(
    budgetsVsActual: BudgetVsActual[],
  ): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];
    const now = new Date();

    for (const bva of budgetsVsActual) {
      if (bva.status === BudgetStatus.OVER_BUDGET) {
        alerts.push({
          budgetId: bva.budget.id,
          budgetName: bva.budget.name,
          type: AlertType.OVER_BUDGET,
          message: `Budget "${bva.budget.name}" has exceeded its limit by ${Math.abs(bva.variance).toFixed(2)}`,
          severity: AlertSeverity.CRITICAL,
          createdAt: now,
        });
      } else if (bva.status === BudgetStatus.AT_RISK) {
        alerts.push({
          budgetId: bva.budget.id,
          budgetName: bva.budget.name,
          type: AlertType.APPROACHING_LIMIT,
          message: `Budget "${bva.budget.name}" is at ${bva.utilizationPercent.toFixed(1)}% utilization`,
          severity: AlertSeverity.WARNING,
          createdAt: now,
        });
      } else if (
        bva.utilizationPercent >= APPROACHING_LIMIT_THRESHOLD &&
        bva.status === BudgetStatus.ON_TRACK
      ) {
        alerts.push({
          budgetId: bva.budget.id,
          budgetName: bva.budget.name,
          type: AlertType.APPROACHING_LIMIT,
          message: `Budget "${bva.budget.name}" has used ${bva.utilizationPercent.toFixed(1)}% of its allocation`,
          severity: AlertSeverity.INFO,
          createdAt: now,
        });
      }

      if (
        bva.daysRemaining !== null &&
        bva.daysRemaining <= 7 &&
        bva.daysRemaining > 0
      ) {
        alerts.push({
          budgetId: bva.budget.id,
          budgetName: bva.budget.name,
          type: AlertType.PERIOD_ENDING,
          message: `Budget "${bva.budget.name}" period ends in ${bva.daysRemaining} days`,
          severity: AlertSeverity.INFO,
          createdAt: now,
        });
      }
    }

    return alerts;
  }

  async getBudgetDashboard(
    userId: string,
    input: BudgetDashboardInput,
  ): Promise<BudgetDashboard> {
    const budgets = await this.prismaService.budget.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });

    const budgetsVsActual: BudgetVsActual[] = [];
    for (const budget of budgets) {
      const bva = await this.getBudgetVsActual(budget.id, userId);
      budgetsVsActual.push(bva);
    }

    let filteredBudgets = budgetsVsActual;
    if (input.status) {
      filteredBudgets = budgetsVsActual.filter(
        (b) => b.status === input.status,
      );
    }

    const skip = ((input.page || 1) - 1) * (input.limit || 10);
    const paginatedBudgets = filteredBudgets.slice(
      skip,
      skip + (input.limit || 10),
    );

    const totalBudgeted = budgetsVsActual.reduce(
      (sum, b) => sum + b.budgetedAmount,
      0,
    );
    const totalActual = budgetsVsActual.reduce(
      (sum, b) => sum + b.actualSpending,
      0,
    );
    const onTrack = budgetsVsActual.filter(
      (b) => b.status === BudgetStatus.ON_TRACK,
    ).length;
    const atRisk = budgetsVsActual.filter(
      (b) => b.status === BudgetStatus.AT_RISK,
    ).length;
    const overBudget = budgetsVsActual.filter(
      (b) => b.status === BudgetStatus.OVER_BUDGET,
    ).length;
    const averageUtilization =
      budgetsVsActual.length > 0
        ? budgetsVsActual.reduce((sum, b) => sum + b.utilizationPercent, 0) /
          budgetsVsActual.length
        : 0;

    const summary: BudgetSummary = {
      totalBudgets: budgets.length,
      onTrack,
      atRisk,
      overBudget,
      totalBudgeted,
      totalActual,
      totalVariance: totalActual - totalBudgeted,
      averageUtilization: Math.round(averageUtilization * 100) / 100,
    };

    const alerts = this.generateBudgetAlerts(budgetsVsActual);

    return {
      summary,
      budgets: paginatedBudgets,
      alerts,
      lastUpdated: new Date(),
    };
  }
}

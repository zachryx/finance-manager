import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import {
  CashPosition,
  AccountCashPosition,
  CurrencyCashPosition,
  RiskLevel,
} from "./entities/cash-position.entity";
import {
  CashFlowPoint,
  CashFlowSummary,
  ProjectionFactor,
  FactorType,
} from "./entities/cash-flow-projection.entity";
import { CashFlowProjection } from "./entities/cash-flow.entity";
import {
  CashFlowProjectionInput,
  ScenarioType,
} from "./inputs/cash-flow-projection.input";
import {
  CashFlowAlert,
  AlertType,
  AlertSeverity,
} from "./entities/cash-flow-alert.entity";

const LOW_CASH_THRESHOLD = 1000;
const CRITICAL_CASH_THRESHOLD = 500;

@Injectable()
export class CashFlowService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCurrentCashPosition(userId: string): Promise<CashPosition> {
    const accounts = await this.prismaService.account.findMany({
      where: { userId },
    });

    const totalCash = accounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0,
    );

    const accountPositions: AccountCashPosition[] = accounts.map((acc) => ({
      accountId: acc.id,
      accountName: acc.name,
      balance: acc.balance || 0,
      currency: acc.currency,
      percentage: totalCash > 0 ? ((acc.balance || 0) / totalCash) * 100 : 0,
    }));

    const currencyMap = new Map<string, AccountCashPosition[]>();
    for (const pos of accountPositions) {
      const existing = currencyMap.get(pos.currency) || [];
      existing.push(pos);
      currencyMap.set(pos.currency, existing);
    }

    const byCurrency: CurrencyCashPosition[] = Array.from(
      currencyMap.entries(),
    ).map(([currency, accs]) => ({
      currency,
      total: accs.reduce((sum, acc) => sum + acc.balance, 0),
      accounts: accs,
    }));

    return {
      totalCash,
      accounts: accountPositions,
      byCurrency,
      lastUpdated: new Date(),
    };
  }

  async getProjectedCashFlow(
    userId: string,
    input: CashFlowProjectionInput,
  ): Promise<CashFlowProjection> {
    const currentPosition = await this.getCurrentCashPosition(userId);
    const currentBalance = currentPosition.totalCash;

    const days = input.days || 90;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const startDate = new Date();

    const incomes = await this.prismaService.income.findMany({
      where: {
        userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const expenses = await this.prismaService.expense.findMany({
      where: {
        userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const budgets = await this.prismaService.budget.findMany({
      where: {
        userId,
        startTime: { lte: endDate },
        endTime: { gte: startDate },
      },
    });

    const projections: CashFlowPoint[] = [];
    let runningBalance = currentBalance;
    let totalProjectedIncome = 0;
    let totalProjectedExpenses = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= days; i++) {
      const projectionDate = new Date(today);
      projectionDate.setDate(projectionDate.getDate() + i);

      const dayIncome = incomes
        .filter((inc) => {
          const incDate = new Date(inc.created_at);
          return incDate.toDateString() === projectionDate.toDateString();
        })
        .reduce((sum, inc) => sum + (inc.amount || 0), 0);

      const dayExpenses = expenses
        .filter((exp) => {
          const expDate = new Date(exp.created_at);
          return expDate.toDateString() === projectionDate.toDateString();
        })
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      let budgetExpense = 0;
      if (input.includeBudgets) {
        for (const budget of budgets) {
          if (
            projectionDate >= budget.startTime &&
            projectionDate <= budget.endTime
          ) {
            const daysInBudget =
              (budget.endTime.getTime() - budget.startTime.getTime()) /
              (1000 * 60 * 60 * 24);
            const daysPassed =
              (projectionDate.getTime() - budget.startTime.getTime()) /
              (1000 * 60 * 60 * 24);
            budgetExpense += (budget.amount / daysInBudget) * 1;
          }
        }
      }

      const factors: ProjectionFactor[] = [];

      if (dayIncome > 0) {
        factors.push({
          type: FactorType.KNOWN_INCOME,
          description: "Known income for this day",
          amount: dayIncome,
          confidence: 1.0,
        });
      }

      if (dayExpenses > 0) {
        factors.push({
          type: FactorType.KNOWN_EXPENSE,
          description: "Known expenses for this day",
          amount: dayExpenses,
          confidence: 1.0,
        });
      }

      if (budgetExpense > 0) {
        factors.push({
          type: FactorType.BUDGETED_EXPENSE,
          description: "Budgeted expense allocation",
          amount: budgetExpense,
          confidence: 0.7,
        });
      }

      const projectedIncome =
        input.scenario === ScenarioType.OPTIMISTIC
          ? dayIncome * 1.1
          : input.scenario === ScenarioType.PESSIMISTIC
            ? dayIncome * 0.9
            : dayIncome;

      const projectedExpenses =
        input.scenario === ScenarioType.OPTIMISTIC
          ? dayExpenses * 0.9
          : input.scenario === ScenarioType.PESSIMISTIC
            ? dayExpenses * 1.1
            : dayExpenses + budgetExpense;

      totalProjectedIncome += projectedIncome;
      totalProjectedExpenses += projectedExpenses;

      runningBalance += projectedIncome - projectedExpenses;

      projections.push({
        date: projectionDate,
        projectedBalance: Math.round(runningBalance * 100) / 100,
        projectedIncome: Math.round(projectedIncome * 100) / 100,
        projectedExpenses: Math.round(projectedExpenses * 100) / 100,
        confidence: 0.8,
        factors,
      });
    }

    const endingBalance =
      projections[projections.length - 1]?.projectedBalance || currentBalance;

    let daysUntilNegative: number | null = null;
    for (let i = 0; i < projections.length; i++) {
      if (projections[i].projectedBalance < 0) {
        daysUntilNegative = i;
        break;
      }
    }

    let riskLevelValue = RiskLevel.LOW;
    if (daysUntilNegative !== null && daysUntilNegative <= 7) {
      riskLevelValue = RiskLevel.CRITICAL;
    } else if (daysUntilNegative !== null && daysUntilNegative <= 30) {
      riskLevelValue = RiskLevel.HIGH;
    } else if (currentBalance < CRITICAL_CASH_THRESHOLD) {
      riskLevelValue = RiskLevel.CRITICAL;
    } else if (currentBalance < LOW_CASH_THRESHOLD) {
      riskLevelValue = RiskLevel.MEDIUM;
    }

    const summary: CashFlowSummary = {
      totalProjectedIncome: Math.round(totalProjectedIncome * 100) / 100,
      totalProjectedExpenses: Math.round(totalProjectedExpenses * 100) / 100,
      netCashFlow:
        Math.round((totalProjectedIncome - totalProjectedExpenses) * 100) / 100,
      endingBalance: Math.round(endingBalance * 100) / 100,
      daysUntilNegative,
      riskLevel: riskLevelValue,
    };

    const alerts = this.generateCashFlowAlerts(currentBalance, projections);

    return {
      currentBalance: Math.round(currentBalance * 100) / 100,
      projections,
      summary,
      alerts,
    };
  }

  private generateCashFlowAlerts(
    currentBalance: number,
    projections: CashFlowPoint[],
  ): CashFlowAlert[] {
    const alerts: CashFlowAlert[] = [];
    const now = new Date();

    if (currentBalance < CRITICAL_CASH_THRESHOLD) {
      alerts.push({
        type: AlertType.LOW_CASH,
        message: `Critical: Cash balance is very low at ${currentBalance.toFixed(2)}`,
        severity: AlertSeverity.CRITICAL,
        date: now,
        projectedDate: null,
        recommendation: "Immediate action required to increase cash flow",
      });
    } else if (currentBalance < LOW_CASH_THRESHOLD) {
      alerts.push({
        type: AlertType.LOW_CASH,
        message: `Warning: Cash balance is below threshold at ${currentBalance.toFixed(2)}`,
        severity: AlertSeverity.WARNING,
        date: now,
        projectedDate: null,
        recommendation: "Consider reviewing expenses to improve cash position",
      });
    }

    const negativePoint = projections.find((p) => p.projectedBalance < 0);
    if (negativePoint) {
      const daysUntilNegative = projections.indexOf(negativePoint);
      alerts.push({
        type: AlertType.NEGATIVE_PROJECTION,
        message: `Projected negative cash flow in ${daysUntilNegative} days`,
        severity:
          daysUntilNegative <= 7
            ? AlertSeverity.CRITICAL
            : AlertSeverity.WARNING,
        date: now,
        projectedDate: negativePoint.date,
        recommendation:
          "Review upcoming expenses and consider delaying non-essential spending",
      });
    }

    return alerts;
  }

  async getCashFlowAlerts(userId: string): Promise<CashFlowAlert[]> {
    const projection = await this.getProjectedCashFlow(userId, {
      days: 90,
      includeBudgets: true,
      scenario: ScenarioType.REALISTIC,
    });

    return projection.alerts;
  }
}

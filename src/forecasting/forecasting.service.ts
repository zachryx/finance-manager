import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import {
  ForecastingResult,
  ScenarioProjection,
  ForecastTrend,
} from "./entities/forecasting.entity";
import { ForecastingInput, WhatIfInput } from "./inputs/forecasting.input";

@Injectable()
export class ForecastingService {
  constructor(private readonly prismaService: PrismaService) {}

  async generateForecast(
    userId: string,
    input: ForecastingInput,
  ): Promise<ForecastingResult> {
    const days = input.days || 90;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + days);

    const historicalStart = new Date();
    historicalStart.setDate(historicalStart.getDate() - days);

    const [incomes, expenses, budgets] = await Promise.all([
      this.prismaService.income.findMany({
        where: {
          userId,
          created_at: { gte: historicalStart, lte: new Date() },
        },
      }),
      this.prismaService.expense.findMany({
        where: {
          userId,
          created_at: { gte: historicalStart, lte: new Date() },
        },
      }),
      this.prismaService.budget.findMany({
        where: { userId },
      }),
    ]);

    const avgIncome =
      incomes.length > 0
        ? incomes.reduce((sum, i) => sum + (i.amount || 0), 0) / incomes.length
        : 0;
    const avgExpenses =
      expenses.length > 0
        ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0) /
          expenses.length
        : 0;

    const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

    const scenarios: ScenarioProjection[] = [];

    scenarios.push({
      scenario: "OPTIMISTIC",
      projectedIncome: Math.round(avgIncome * 1.15 * (days / 30) * 100) / 100,
      projectedExpenses:
        Math.round(avgExpenses * 0.9 * (days / 30) * 100) / 100,
      projectedSavings:
        Math.round((avgIncome * 1.15 - avgExpenses * 0.9) * (days / 30) * 100) /
        100,
      confidenceLevel: 0.6,
      assumptions: ["Income increases by 15%", "Expenses decrease by 10%"],
    });

    scenarios.push({
      scenario: "REALISTIC",
      projectedIncome: Math.round(avgIncome * (days / 30) * 100) / 100,
      projectedExpenses: Math.round(avgExpenses * (days / 30) * 100) / 100,
      projectedSavings:
        Math.round((avgIncome - avgExpenses) * (days / 30) * 100) / 100,
      confidenceLevel: 0.8,
      assumptions: ["Current trends continue"],
    });

    scenarios.push({
      scenario: "PESSIMISTIC",
      projectedIncome: Math.round(avgIncome * 0.85 * (days / 30) * 100) / 100,
      projectedExpenses:
        Math.round(avgExpenses * 1.1 * (days / 30) * 100) / 100,
      projectedSavings:
        Math.round((avgIncome * 0.85 - avgExpenses * 1.1) * (days / 30) * 100) /
        100,
      confidenceLevel: 0.6,
      assumptions: ["Income decreases by 15%", "Expenses increase by 10%"],
    });

    const trends: ForecastTrend[] = [];

    if (input.includeTrends) {
      const currentSavings = avgIncome - avgExpenses;
      const realisticSavings =
        scenarios.find((s) => s.scenario === "REALISTIC")?.projectedSavings ||
        0;

      trends.push({
        metric: "Monthly Savings",
        currentValue: currentSavings,
        projectedValue: realisticSavings / (days / 30),
        changePercent:
          currentSavings > 0
            ? ((realisticSavings / (days / 30) - currentSavings) /
                currentSavings) *
              100
            : 0,
        trend:
          realisticSavings > currentSavings * (days / 30)
            ? "improving"
            : "declining",
      });

      trends.push({
        metric: "Total Budget",
        currentValue: totalBudget,
        projectedValue: totalBudget,
        changePercent: 0,
        trend: "stable",
      });
    }

    return {
      period: `${days} days`,
      startDate: new Date(),
      endDate,
      scenarios,
      trends,
      generatedAt: new Date(),
    };
  }

  async whatIfAnalysis(
    userId: string,
    input: WhatIfInput,
  ): Promise<ScenarioProjection> {
    const historicalStart = new Date();
    historicalStart.setDate(historicalStart.getDate() - 30);

    const [incomes, expenses] = await Promise.all([
      this.prismaService.income.aggregate({
        where: { userId, created_at: { gte: historicalStart } },
        _sum: { amount: true },
      }),
      this.prismaService.expense.aggregate({
        where: { userId, created_at: { gte: historicalStart } },
        _sum: { amount: true },
      }),
    ]);

    const baseIncome = incomes._sum.amount || 0;
    const baseExpenses = expenses._sum.amount || 0;

    const adjustedIncome = baseIncome * (1 + input.incomeChange / 100);
    const adjustedExpenses = baseExpenses * (1 + input.expenseChange / 100);
    const savings = adjustedIncome - adjustedExpenses;

    return {
      scenario: input.scenarioName,
      projectedIncome: Math.round(adjustedIncome * 100) / 100,
      projectedExpenses: Math.round(adjustedExpenses * 100) / 100,
      projectedSavings: Math.round(savings * 100) / 100,
      confidenceLevel: 0.7,
      assumptions: [
        input.description || "Custom scenario",
        `Income changed by ${input.incomeChange}%`,
        `Expenses changed by ${input.expenseChange}%`,
      ],
    };
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import {
  ExecutiveDashboard,
  KpiMetric,
  FinancialSummary,
  AccountSummary,
} from "./entities/dashboard.entity";
import {
  IncomeStatement,
  IncomeEntry,
  ExpenseEntry,
} from "./entities/income-statement.entity";
import {
  CategoryBreakdown,
  CategoryData,
  CategoryTrend,
} from "./entities/category-breakdown.entity";
import { ReportInput, DashboardInput } from "./inputs/report.input";
import { ExpenseCategory } from "@prisma/client";

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getExecutiveDashboard(
    userId: string,
    input: DashboardInput,
  ): Promise<ExecutiveDashboard> {
    const days = input.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    const prevEndDate = new Date(startDate);

    const [
      currentIncomes,
      prevIncomes,
      currentExpenses,
      prevExpenses,
      accounts,
      budgets,
    ] = await Promise.all([
      this.prismaService.income.aggregate({
        where: { userId, created_at: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      this.prismaService.income.aggregate({
        where: { userId, created_at: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { amount: true },
      }),
      this.prismaService.expense.aggregate({
        where: { userId, created_at: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      this.prismaService.expense.aggregate({
        where: { userId, created_at: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { amount: true },
      }),
      this.prismaService.account.findMany({ where: { userId } }),
      this.prismaService.budget.findMany({
        where: {
          userId,
          startTime: { lte: endDate },
          endTime: { gte: startDate },
        },
      }),
    ]);

    const totalIncome = currentIncomes._sum.amount || 0;
    const prevIncomeTotal = prevIncomes._sum.amount || 0;
    const totalExpenses = currentExpenses._sum.amount || 0;
    const prevExpensesTotal = prevExpenses._sum.amount || 0;
    const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

    const incomeChange =
      prevIncomeTotal > 0
        ? ((totalIncome - prevIncomeTotal) / prevIncomeTotal) * 100
        : 0;
    const expenseChange =
      prevExpensesTotal > 0
        ? ((totalExpenses - prevExpensesTotal) / prevExpensesTotal) * 100
        : 0;

    const kpis: KpiMetric[] = [
      {
        name: "Total Income",
        value: totalIncome,
        changePercent: Math.round(incomeChange * 100) / 100,
        trend: incomeChange >= 0 ? "up" : "down",
      },
      {
        name: "Total Expenses",
        value: totalExpenses,
        changePercent: Math.round(expenseChange * 100) / 100,
        trend: expenseChange <= 0 ? "up" : "down",
      },
      {
        name: "Net Savings",
        value: totalIncome - totalExpenses,
        changePercent: 0,
        trend: "neutral",
      },
      {
        name: "Savings Rate",
        value:
          totalIncome > 0
            ? ((totalIncome - totalExpenses) / totalIncome) * 100
            : 0,
        changePercent: 0,
        trend: "neutral",
      },
    ];

    const financialSummary: FinancialSummary = {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate:
        totalIncome > 0
          ? ((totalIncome - totalExpenses) / totalIncome) * 100
          : 0,
      totalBudget,
      budgetUtilization:
        totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
    };

    const accountSummaries: AccountSummary[] = accounts.map((acc) => ({
      accountId: acc.id,
      accountName: acc.name,
      balance: acc.balance || 0,
      change: 0,
    }));

    return {
      kpis,
      summary: financialSummary,
      accounts: accountSummaries,
      lastUpdated: new Date(),
    };
  }

  async getIncomeStatement(
    userId: string,
    input: ReportInput,
  ): Promise<IncomeStatement> {
    const { startDate, endDate } = input;

    const incomes = await this.prismaService.income.findMany({
      where: { userId, created_at: { gte: startDate, lte: endDate } },
    });

    const expenses = await this.prismaService.expense.findMany({
      where: { userId, created_at: { gte: startDate, lte: endDate } },
    });

    const totalIncome = incomes.reduce(
      (sum, inc) => sum + (inc.amount || 0),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0,
    );

    const incomeMap = new Map<string, number>();
    for (const inc of incomes) {
      const key = inc.source || "Other";
      incomeMap.set(key, (incomeMap.get(key) || 0) + (inc.amount || 0));
    }

    const incomeBreakdown: IncomeEntry[] = Array.from(incomeMap.entries()).map(
      ([source, amount]) => ({
        source,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }),
    );

    const expenseMap = new Map<string, number>();
    for (const exp of expenses) {
      const key = exp.category || "Other";
      expenseMap.set(key, (expenseMap.get(key) || 0) + (exp.amount || 0));
    }

    const expenseBreakdown: ExpenseEntry[] = Array.from(
      expenseMap.entries(),
    ).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));

    const period = `${startDate.toISOString().split("T")[0]} - ${endDate.toISOString().split("T")[0]}`;

    return {
      period,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      incomeBreakdown,
      expenseBreakdown,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    input: ReportInput,
  ): Promise<CategoryBreakdown> {
    const { startDate, endDate } = input;

    const expenses = await this.prismaService.expense.findMany({
      where: { userId, created_at: { gte: startDate, lte: endDate } },
    });

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0,
    );

    const categoryMap = new Map<string, { amount: number; count: number }>();
    for (const exp of expenses) {
      const key = exp.category || "Other";
      const current = categoryMap.get(key) || { amount: 0, count: 0 };
      categoryMap.set(key, {
        amount: current.amount + (exp.amount || 0),
        count: current.count + 1,
      });
    }

    const categories: CategoryData[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        count: data.count,
        average: data.count > 0 ? data.amount / data.count : 0,
      }),
    );

    const period = `${startDate.toISOString().split("T")[0]} - ${endDate.toISOString().split("T")[0]}`;

    return {
      period,
      startDate,
      endDate,
      totalExpenses,
      categories,
      trends: [],
    };
  }
}

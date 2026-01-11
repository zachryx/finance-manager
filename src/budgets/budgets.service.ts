import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import { CreateBudgetInput } from "./inputs/create-budget.input";
import { UpdateBudgetInput } from "./inputs/update-budget.input";
import { FindBudgetsInput } from "./inputs/find-budgets.input";
import { Prisma } from "@prisma/client";

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
          "Budget with the same name already exists"
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
    data: Omit<UpdateBudgetInput, "budgetId">
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
}

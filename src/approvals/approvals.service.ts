import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import { ApprovalRequest } from "./entities/approval-request.entity";
import {
  SubmitApprovalInput,
  ApproveInput,
  ApprovalFilterInput,
} from "./inputs/approval.input";
import { ApprovalsResponse } from "./responses/approvals.response";
import { ApprovalStatus, ApprovalType } from "../generated/prisma/index";

const EXPENSE_APPROVAL_THRESHOLD = 1000;
const BUDGET_APPROVAL_THRESHOLD = 5000;

@Injectable()
export class ApprovalsService {
  constructor(private readonly prismaService: PrismaService) {}

  async submitForApproval(
    userId: string,
    input: SubmitApprovalInput,
  ): Promise<ApprovalRequest> {
    const type = input.type as ApprovalType;

    if (
      type === ApprovalType.EXPENSE &&
      input.amount < EXPENSE_APPROVAL_THRESHOLD
    ) {
      throw new BadRequestException(
        `Expense below ${EXPENSE_APPROVAL_THRESHOLD} does not require approval`,
      );
    }

    if (
      type === ApprovalType.BUDGET &&
      input.amount < BUDGET_APPROVAL_THRESHOLD
    ) {
      throw new BadRequestException(
        `Budget below ${BUDGET_APPROVAL_THRESHOLD} does not require approval`,
      );
    }

    const approval = await this.prismaService.approvalRequest.create({
      data: {
        type,
        referenceId: input.referenceId,
        amount: input.amount,
        status: ApprovalStatus.PENDING,
        description: input.description,
        requestedBy: userId,
      },
    });

    return approval as unknown as ApprovalRequest;
  }

  async approveRequest(
    approverId: string,
    input: ApproveInput,
  ): Promise<ApprovalRequest> {
    const approval = await this.prismaService.approvalRequest.findUnique({
      where: { id: input.approvalId },
    });

    if (!approval) {
      throw new NotFoundException("Approval request not found");
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException("Approval request is already resolved");
    }

    const updated = await this.prismaService.approvalRequest.update({
      where: { id: input.approvalId },
      data: {
        status: ApprovalStatus.APPROVED,
        approverId,
        comments: input.comments,
        resolvedAt: new Date(),
      },
    });

    return updated as unknown as ApprovalRequest;
  }

  async rejectRequest(
    approverId: string,
    input: ApproveInput,
  ): Promise<ApprovalRequest> {
    const approval = await this.prismaService.approvalRequest.findUnique({
      where: { id: input.approvalId },
    });

    if (!approval) {
      throw new NotFoundException("Approval request not found");
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException("Approval request is already resolved");
    }

    const updated = await this.prismaService.approvalRequest.update({
      where: { id: input.approvalId },
      data: {
        status: ApprovalStatus.REJECTED,
        approverId,
        comments: input.comments,
        resolvedAt: new Date(),
      },
    });

    return updated as unknown as ApprovalRequest;
  }

  async getPendingApprovals(
    userId: string,
    input: ApprovalFilterInput,
  ): Promise<ApprovalsResponse> {
    const { page, limit, status, type } = input;

    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }
    if (type) {
      whereClause.type = type;
    }

    const skip = (page - 1) * limit;
    const [approvals, totalCount] = await Promise.all([
      this.prismaService.approvalRequest.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prismaService.approvalRequest.count({
        where: whereClause,
      }),
    ]);

    return {
      data: approvals as unknown as ApprovalRequest[],
      page,
      limit,
      totalCount,
    };
  }

  async getApprovalHistory(
    userId: string,
    input: ApprovalFilterInput,
  ): Promise<ApprovalsResponse> {
    const { page, limit, status, type } = input;

    const whereClause: any = {
      OR: [{ requestedBy: userId }, { approverId: userId }],
    };

    if (status) {
      whereClause.status = status;
    }
    if (type) {
      whereClause.type = type;
    }

    const skip = (page - 1) * limit;
    const [approvals, totalCount] = await Promise.all([
      this.prismaService.approvalRequest.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prismaService.approvalRequest.count({
        where: whereClause,
      }),
    ]);

    return {
      data: approvals as unknown as ApprovalRequest[],
      page,
      limit,
      totalCount,
    };
  }

  async getApprovalById(approvalId: string): Promise<ApprovalRequest> {
    const approval = await this.prismaService.approvalRequest.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new NotFoundException("Approval request not found");
    }

    return approval as unknown as ApprovalRequest;
  }
}

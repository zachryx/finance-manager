import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/services/prisma/prisma.service";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditLogFilterInput } from "./inputs/audit-log.input";
import { AuditLogsResponse } from "./responses/audit-logs.response";
import { AuditAction } from "../generated/prisma/index";

@Injectable()
export class AuditService {
  constructor(private readonly prismaService: PrismaService) {}

  async logAudit(
    userId: string,
    entityType: string,
    entityId: string,
    action: AuditAction,
    previousValue?: any,
    newValue?: any,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    const auditLog = await this.prismaService.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        userId,
        previousValue: previousValue ? JSON.stringify(previousValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        reason,
        ipAddress,
        userAgent,
      },
    });

    return auditLog as unknown as AuditLog;
  }

  async getAuditLogs(
    userId: string,
    input: AuditLogFilterInput,
  ): Promise<AuditLogsResponse> {
    const {
      page,
      limit,
      entityType,
      entityId,
      action,
      userId: filterUserId,
    } = input;

    const whereClause: any = {};

    if (entityType) {
      whereClause.entityType = entityType;
    }
    if (entityId) {
      whereClause.entityId = entityId;
    }
    if (action) {
      whereClause.action = action;
    }
    if (filterUserId) {
      whereClause.userId = filterUserId;
    } else {
      whereClause.userId = userId;
    }

    const skip = (page - 1) * limit;
    const [logs, totalCount] = await Promise.all([
      this.prismaService.auditLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prismaService.auditLog.count({
        where: whereClause,
      }),
    ]);

    const data = logs.map((log) => ({
      ...log,
      previousValue: log.previousValue as any,
      newValue: log.newValue as any,
    }));

    return {
      data: data as unknown as AuditLog[],
      page,
      limit,
      totalCount,
    };
  }

  async getEntityHistory(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    const logs = await this.prismaService.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "asc" },
    });

    return logs as unknown as AuditLog[];
  }
}

import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql.-auth.guard";
import { CurrentUser } from "../common/decorators/current-user";
import { User } from "../users/entities/user.entity";
import { AuditService } from "./audit.service";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditLogFilterInput } from "./inputs/audit-log.input";
import { AuditLogsResponse } from "./responses/audit-logs.response";

@Resolver("Audit")
@UseGuards(GqlAuthGuard)
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Query(() => AuditLogsResponse)
  async getAuditLogs(
    @CurrentUser() user: User,
    @Args("input") input: AuditLogFilterInput,
  ) {
    return this.auditService.getAuditLogs(user.id, input);
  }

  @Query(() => [AuditLog])
  async getEntityHistory(
    @Args("entityType", { type: () => String }) entityType: string,
    @Args("entityId", { type: () => String }) entityId: string,
  ) {
    return this.auditService.getEntityHistory(entityType, entityId);
  }
}

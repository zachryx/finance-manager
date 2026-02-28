import { Module } from "@nestjs/common";
import { ApprovalsService } from "./approvals.service";
import { ApprovalsResolver } from "./approvals.resolver";

@Module({
  providers: [ApprovalsService, ApprovalsResolver],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}

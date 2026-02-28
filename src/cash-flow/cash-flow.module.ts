import { Module } from "@nestjs/common";
import { CashFlowService } from "./cash-flow.service";
import { CashFlowResolver } from "./cash-flow.resolver";

@Module({
  providers: [CashFlowService, CashFlowResolver],
  exports: [CashFlowService],
})
export class CashFlowModule {}

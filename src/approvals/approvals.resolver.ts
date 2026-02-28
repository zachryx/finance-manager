import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql.-auth.guard";
import { CurrentUser } from "../common/decorators/current-user";
import { User } from "../users/entities/user.entity";
import { ApprovalsService } from "./approvals.service";
import { ApprovalRequest } from "./entities/approval-request.entity";
import {
  SubmitApprovalInput,
  ApproveInput,
  ApprovalFilterInput,
} from "./inputs/approval.input";
import { ApprovalsResponse } from "./responses/approvals.response";

@Resolver("Approvals")
@UseGuards(GqlAuthGuard)
export class ApprovalsResolver {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Query(() => ApprovalsResponse)
  async getPendingApprovals(
    @CurrentUser() user: User,
    @Args("input") input: ApprovalFilterInput,
  ) {
    return this.approvalsService.getPendingApprovals(user.id, input);
  }

  @Query(() => ApprovalsResponse)
  async getApprovalHistory(
    @CurrentUser() user: User,
    @Args("input") input: ApprovalFilterInput,
  ) {
    return this.approvalsService.getApprovalHistory(user.id, input);
  }

  @Query(() => ApprovalRequest)
  async getApproval(@Args("id", { type: () => String }) id: string) {
    return this.approvalsService.getApprovalById(id);
  }

  @Mutation(() => ApprovalRequest)
  async submitForApproval(
    @CurrentUser() user: User,
    @Args("input") input: SubmitApprovalInput,
  ) {
    return this.approvalsService.submitForApproval(user.id, input);
  }

  @Mutation(() => ApprovalRequest)
  async approveRequest(
    @CurrentUser() user: User,
    @Args("input") input: ApproveInput,
  ) {
    return this.approvalsService.approveRequest(user.id, input);
  }

  @Mutation(() => ApprovalRequest)
  async rejectRequest(
    @CurrentUser() user: User,
    @Args("input") input: ApproveInput,
  ) {
    return this.approvalsService.rejectRequest(user.id, input);
  }
}

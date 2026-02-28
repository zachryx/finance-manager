import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../auth/gql.-auth.guard";
import { CurrentUser } from "../common/decorators/current-user";
import { User } from "../users/entities/user.entity";
import { ForecastingService } from "./forecasting.service";
import {
  ForecastingResult,
  ScenarioProjection,
} from "./entities/forecasting.entity";
import { ForecastingInput, WhatIfInput } from "./inputs/forecasting.input";

@Resolver("Forecasting")
@UseGuards(GqlAuthGuard)
export class ForecastingResolver {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Query(() => ForecastingResult)
  async generateForecast(
    @CurrentUser() user: User,
    @Args("input") input: ForecastingInput,
  ) {
    return this.forecastingService.generateForecast(user.id, input);
  }

  @Mutation(() => ScenarioProjection)
  async whatIfAnalysis(
    @CurrentUser() user: User,
    @Args("input") input: WhatIfInput,
  ) {
    return this.forecastingService.whatIfAnalysis(user.id, input);
  }
}

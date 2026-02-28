import { Module } from "@nestjs/common";
import { ForecastingService } from "./forecasting.service";
import { ForecastingResolver } from "./forecasting.resolver";

@Module({
  providers: [ForecastingService, ForecastingResolver],
  exports: [ForecastingService],
})
export class ForecastingModule {}

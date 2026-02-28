import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { CacheModule } from "@nestjs/cache-manager";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { AccountsModule } from "./accounts/accounts.module";
import { ApprovalsModule } from "./approvals/approvals.module";
import { AuthModule } from "./auth/auth.module";
import { BudgetsModule } from "./budgets/budgets.module";
import { CashFlowModule } from "./cash-flow/cash-flow.module";
import { ReportsModule } from "./reports/reports.module";
import config from "./common/configs/config";
import { PrismaModule } from "./common/services/prisma/prisma.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { GqlConfigService } from "./gql.config.service";
import { IncomeModule } from "./income/income.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    CacheModule.register({
      isGlobal: true,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useClass: GqlConfigService,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    BudgetsModule,
    ApprovalsModule,
    CashFlowModule,
    ReportsModule,
    AccountsModule,
    IncomeModule,
    ExpensesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

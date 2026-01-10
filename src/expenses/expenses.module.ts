import { Module } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { ExpensesResolver } from "./expenses.resolver";
import { AccountsService } from "../accounts/accounts.service";

@Module({
  providers: [
    ExpensesResolver,
    ExpensesService,
    AccountsService,
  ],
})
export class ExpensesModule {}

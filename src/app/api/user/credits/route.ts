import { NextRequest } from "next/server";
import { ok, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";
import { CreditService } from "@/lib/services/credit";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const account = await CreditService.getAccount(user.userId);
  const transactions = await CreditService.getTransactions(user.userId, 10);

  return ok({
    balance: account.balance,
    frozen: account.frozen,
    available: account.balance - account.frozen,
    recentTransactions: transactions,
  });
}

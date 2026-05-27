import { NextRequest } from "next/server";
import { ok, fail, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";
import { PaymentService } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { orderNo } = await req.json();
  if (!orderNo) return fail("缺少订单号");

  try {
    const result = await PaymentService.mockPaySuccess(user.userId, orderNo);
    return ok(result);
  } catch (e: any) {
    return fail(e.message);
  }
}

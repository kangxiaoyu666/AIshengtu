import { NextRequest } from "next/server";
import { ok, fail, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";
import { PaymentService } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { packageId, channel } = await req.json();
  if (!packageId || !channel) return fail("缺少参数");

  try {
    const result = await PaymentService.createOrder({ userId: user.userId, packageId, channel });
    return ok(result);
  } catch (e: any) {
    return fail(e.message);
  }
}

import { NextRequest } from "next/server";
import { ok } from "@/lib/response";
import { PaymentService } from "@/lib/payment";

export async function GET(_req: NextRequest) {
  return ok(PaymentService.getPackages());
}

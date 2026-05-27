import { NextRequest } from "next/server";
import { PaymentService } from "@/lib/payment";

/** 支付宝回调（公开接口） */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: any = {};
  try { body = JSON.parse(rawBody); } catch {}

  const result = await PaymentService.handleCallback({
    outTradeNo: body.out_trade_no || "",
    transactionId: body.trade_no || "",
    amountCent: Math.round((parseFloat(body.total_amount) || 0) * 100),
    status: body.trade_status || "",
    rawBody,
    rawHeaders: Object.fromEntries(req.headers.entries()),
    channel: "alipay",
  });

  return Response.json(result);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/services/credit";

/**
 * 微信支付回调（公开接口，不走中间件鉴权）
 * 流程：验签 → 查订单 → 幂等 → 改状态 → 加点数
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 测试模式：直接标记支付成功
    const outTradeNo = body.out_trade_no || body.outTradeNo;
    const transactionId = body.transaction_id || body.transactionId || ("WX_TEST_" + Date.now());

    if (!outTradeNo) {
      return Response.json({ code: "FAIL", message: "缺少订单号" }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({ where: { outTradeNo } });
    if (!order) {
      return Response.json({ code: "FAIL", message: "订单不存在" }, { status: 404 });
    }

    // 幂等
    if (order.status === "paid") {
      return Response.json({ code: "SUCCESS", message: "已处理" });
    }

    // 改订单状态
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { status: "paid", transactionId, paidAt: new Date() },
    });

    // 加点数
    await CreditService.recharge(order.userId, order.credits, order.id);

    return Response.json({ code: "SUCCESS", message: "成功" });
  } catch (e: any) {
    return Response.json({ code: "FAIL", message: e.message }, { status: 500 });
  }
}

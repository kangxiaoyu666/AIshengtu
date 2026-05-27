import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/response";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getUserFromRequest(req);
  if (!admin || admin.role !== "admin") return unauthorized();

  const orders = await prisma.paymentOrder.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok(orders);
}

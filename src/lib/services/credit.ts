import { prisma } from "@/lib/prisma";

export class CreditService {
  static async getAccount(userId: string) {
    let account = await prisma.creditAccount.findUnique({ where: { userId } });
    if (!account) {
      account = await prisma.creditAccount.create({ data: { userId, balance: 0, frozen: 0 } });
    }
    return account;
  }

  static async getBalance(userId: string): Promise<number> {
    const a = await this.getAccount(userId);
    return a.balance - a.frozen;
  }

  static async recharge(userId: string, credits: number, orderId: string) {
    const a = await this.getAccount(userId);
    const u = await prisma.creditAccount.update({ where: { userId }, data: { balance: a.balance + credits } });
    await prisma.creditTransaction.create({ data: { userId, amount: credits, type: "recharge", balanceAfter: u.balance, relatedId: orderId, remark: `充值 ${credits} 点` } });
    return u;
  }

  static async freeze(userId: string, credits: number, taskId: string) {
    const a = await this.getAccount(userId);
    if (a.balance - a.frozen < credits) throw new Error(`点数不足`);
    const u = await prisma.creditAccount.update({ where: { userId }, data: { frozen: a.frozen + credits } });
    await prisma.creditTransaction.create({ data: { userId, amount: -credits, type: "freeze", balanceAfter: u.balance - u.frozen, relatedId: taskId, remark: `冻结 ${credits} 点` } });
    return u;
  }

  static async consume(userId: string, credits: number, taskId: string) {
    const a = await prisma.creditAccount.findUnique({ where: { userId } });
    if (!a) throw new Error("账户不存在");
    const u = await prisma.creditAccount.update({ where: { userId }, data: { balance: a.balance - credits, frozen: Math.max(0, a.frozen - credits) } });
    await prisma.creditTransaction.create({ data: { userId, amount: -credits, type: "consume", balanceAfter: u.balance - u.frozen, relatedId: taskId, remark: `消耗 ${credits} 点` } });
    return u;
  }

  static async unfreeze(userId: string, credits: number, taskId: string) {
    const a = await prisma.creditAccount.findUnique({ where: { userId } });
    if (!a) throw new Error("账户不存在");
    const u = await prisma.creditAccount.update({ where: { userId }, data: { frozen: Math.max(0, a.frozen - credits) } });
    await prisma.creditTransaction.create({ data: { userId, amount: credits, type: "unfreeze", balanceAfter: u.balance - u.frozen, relatedId: taskId, remark: `返还 ${credits} 点` } });
    return u;
  }

  static async getTransactions(userId: string, limit = 50) {
    return prisma.creditTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit });
  }
}

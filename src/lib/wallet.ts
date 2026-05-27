import { WalletBalance, Transaction, RechargePackage } from '@/types';

const STORAGE_KEY = 'jiaotu_wallet';
const TX_KEY = 'jiaotu_transactions';

export const rechargePackages: RechargePackage[] = [
  { id: 'pkg1', points: 100, price: 9.9, label: '100点' },
  { id: 'pkg2', points: 500, price: 39.9, label: '500点', popular: true },
  { id: 'pkg3', points: 1200, price: 79.9, label: '1200点' },
  { id: 'pkg4', points: 3000, price: 169.9, label: '3000点' },
  { id: 'pkg5', points: 8000, price: 399.9, label: '8000点' },
  { id: 'pkg6', points: 20000, price: 899.9, label: '20000点' },
];

export function getWallet(): WalletBalance {
  if (typeof window === 'undefined') return { points: 0, totalRecharged: 0, totalSpent: 0 };
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { points: 0, totalRecharged: 0, totalSpent: 0 };
  } catch {
    return { points: 0, totalRecharged: 0, totalSpent: 0 };
  }
}

export function saveWallet(w: WalletBalance) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const d = localStorage.getItem(TX_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(tx: Transaction) {
  if (typeof window === 'undefined') return;
  const txs = [tx, ...getTransactions()].slice(0, 100);
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

export function rechargePoints(pkg: RechargePackage, method: 'wechat' | 'alipay'): Transaction {
  const wallet = getWallet();
  wallet.points += pkg.points;
  wallet.totalRecharged += pkg.price;
  saveWallet(wallet);

  const tx: Transaction = {
    id: 'tx-' + Date.now(),
    type: 'recharge',
    amount: pkg.points,
    balance: wallet.points,
    description: `${method === 'wechat' ? '微信' : '支付宝'}充值 ${pkg.label}`,
    createdAt: Date.now(),
    status: 'success',
    method,
  };
  saveTransaction(tx);

  // Also save to gallery wallet for backend tracking
  if (typeof window !== 'undefined') {
    const evt = new CustomEvent('wallet-changed', { detail: wallet });
    window.dispatchEvent(evt);
  }

  return tx;
}

export function consumePoints(amount: number, description: string): boolean {
  const wallet = getWallet();
  if (wallet.points < amount) return false;

  wallet.points -= amount;
  wallet.totalSpent += amount;
  saveWallet(wallet);

  const tx: Transaction = {
    id: 'tx-' + Date.now(),
    type: 'consume',
    amount,
    balance: wallet.points,
    description,
    createdAt: Date.now(),
    status: 'success',
    method: 'system',
  };
  saveTransaction(tx);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wallet-changed', { detail: wallet }));
  }

  return true;
}

export function hasEnoughPoints(amount: number): boolean {
  return getWallet().points >= amount;
}

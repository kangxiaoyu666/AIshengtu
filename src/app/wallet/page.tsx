'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Coins, Crown, RefreshCw, X, QrCode, Loader2, CheckCircle, Zap, CreditCard, Sparkles } from 'lucide-react';

interface CreditInfo { balance: number; frozen: number; available: number; recentTransactions?: { id: string; amount: number; type: string; remark: string; createdAt: string }[] }
interface Pkg { id: string; credits: number; amountCent: number; label: string; popular?: boolean }
interface PayChannel { channelCode: string; channelName: string; status: string }

function getToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    const user = JSON.parse(localStorage.getItem('zj_user') || '{}');
    return user.token || '';
  } catch { return ''; }
}

export default function WalletPage() {
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('mock');
  const [qrUrl, setQrUrl] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [payChannels, setPayChannels] = useState<PayChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getToken();

  const fetchCredits = useCallback(async () => {
    try {
      const r = await fetch('/api/user/credits', { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); if (d.success) setCredits(d.data); }
    } catch { /* ignore */ }
  }, [token]);

  const fetchPackages = useCallback(async () => {
    try {
      const r = await fetch('/api/packages');
      if (r.ok) { const d = await r.json(); if (d.success && d.data?.length) setPackages(d.data); }
    } catch { /* ignore */ }
  }, []);

  const fetchChannels = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/payment-channels', { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        const enabled = (d.data || []).filter((c: PayChannel) => c.status === 'enabled');
        setPayChannels(enabled);
        if (enabled.length > 0) setSelectedChannel(enabled[0].channelCode);
      }
    } catch {
      setPayChannels([{ channelCode: 'mock', channelName: '模拟支付（开发）', status: 'enabled' }]);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCredits(), fetchPackages(), fetchChannels()]).finally(() => setLoading(false));
  }, [fetchCredits, fetchPackages, fetchChannels]);

  const handlePay = async (pkg: Pkg) => {
    setSelectedPkg(pkg);
    setShowPay(true);
    setPaying(true);
    setQrUrl('');
    setOrderNo('');
    setPaid(false);

    try {
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageId: pkg.id, channel: selectedChannel }),
      });
      const d = await r.json();

      if (d.success && d.data?.success) {
        const result = d.data;
        setOrderNo(result.orderNo);
        if (result.qrCode) setQrUrl(result.qrCode);
        if (result.mockMode) {
          toast('开发模式', { description: '点击"模拟支付成功"即可到账' });
        }
      } else {
        toast.error(d.error || d.data?.error || '创建订单失败');
        setShowPay(false);
      }
    } catch {
      toast.error('网络错误');
      setShowPay(false);
    } finally {
      setPaying(false);
    }
  };

  const handleMockPay = async () => {
    try {
      const r = await fetch('/api/pay/mock/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderNo }),
      });
      const d = await r.json();
      if (d.success) {
        setPaid(true);
        toast.success(`+${selectedPkg?.credits || 0}点已到账`);
        fetchCredits();
        setTimeout(() => { setShowPay(false); setQrUrl(''); setOrderNo(''); setPaid(false); }, 2000);
      } else {
        toast.error(d.error || '支付失败');
      }
    } catch {
      toast.error('网络错误');
    }
  };

  const channelLabel = (code: string) => {
    const map: Record<string, string> = { wechat: '微信支付', alipay: '支付宝', mock: '模拟支付' };
    return map[code] || code;
  };

  if (loading) return (
    <div className="flex justify-center py-20 min-h-screen bg-[#f4f7ff] items-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
    </div>
  );

  if (!token) return (
    <div className="flex justify-center py-20 min-h-screen bg-[#f4f7ff] items-center flex-col gap-4">
      <p className="text-slate-500">请先登录后查看钱包</p>
      <Button onClick={() => window.location.href = '/login'} className="btn-brand rounded-xl">去登录</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7ff]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 p-8 mb-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur">
              <Coins className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-sm text-white/70 mb-1">可用点数</p>
            <p className="text-5xl font-extrabold tracking-tight">{credits?.available?.toLocaleString() || 0}</p>
            <div className="flex justify-center gap-8 mt-5 text-sm">
              <div><p className="text-white/50 text-xs mb-1">总额</p><p className="font-bold">{credits?.balance?.toLocaleString() || 0}</p></div>
              <div className="w-px bg-white/20" />
              <div><p className="text-white/50 text-xs mb-1">冻结</p><p className="font-bold">{credits?.frozen?.toLocaleString() || 0}</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchCredits} className="mt-4 text-white/60 hover:text-white rounded-xl">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />刷新</Button>
          </div>
        </div>

        {/* Packages */}
        <h2 className="text-lg font-extrabold text-slate-800 mb-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />充值套餐</h2>
        <p className="text-xs text-slate-400 mb-4">选择套餐和支付方式，扫码支付，自动到账</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {packages.map((pkg) => (
            <div key={pkg.id} onClick={() => handlePay(pkg)}
              className={`relative bg-white border rounded-2xl p-4 cursor-pointer transition-all text-center hover:-translate-y-1 hover:shadow-lg ${
                pkg.popular ? 'border-blue-200 shadow-blue-100' : 'border-slate-100 shadow-sm hover:border-slate-200'
              }`}>
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-[10px] shadow-sm">
                  <Crown className="h-3 w-3 mr-0.5" />推荐</Badge>
              )}
              <Coins className={`h-8 w-8 mx-auto mb-2 ${pkg.popular ? 'text-blue-400' : 'text-slate-400'}`} />
              <p className="text-lg font-extrabold text-slate-800">{pkg.credits.toLocaleString()}</p>
              <p className="text-xs text-slate-400">点</p>
              <p className={`text-sm font-bold mt-2 ${pkg.popular ? 'text-blue-500' : 'text-slate-500'}`}>
                ¥{(pkg.amountCent / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPay && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => { if (!paying) { setShowPay(false); } }}>
          <Card className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {!paid && !paying && (
              <button onClick={() => setShowPay(false)}
                className="absolute top-3 right-3 p-2 rounded-xl hover:bg-red-50 text-slate-400">
                <X className="h-4 w-4" /></button>
            )}
            {paid ? (
              <div className="py-8">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-slate-800">支付成功</h3>
                <p className="text-sm text-slate-500">+{selectedPkg.credits.toLocaleString()}点已到账</p>
              </div>
            ) : paying ? (
              <div className="py-8">
                <Loader2 className="h-10 w-10 text-blue-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-slate-500">创建订单中...</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-800 mb-1">扫码支付</h3>
                <p className="text-sm text-blue-600 font-medium mb-1">
                  {selectedPkg.credits.toLocaleString()}点 · ¥{(selectedPkg.amountCent / 100).toFixed(2)}</p>
                <div className="flex justify-center gap-2 mb-4">
                  {payChannels.map(ch => (
                    <button key={ch.channelCode} onClick={() => setSelectedChannel(ch.channelCode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedChannel === ch.channelCode
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}>
                      <CreditCard className="h-3 w-3" />{ch.channelName}</button>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 mb-4 mx-auto w-[250px] h-[250px] flex items-center justify-center border border-slate-200">
                  {qrUrl ? <img src={qrUrl} alt="二维码" className="w-full h-full" />
                    : <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />}
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  <QrCode className="h-3.5 w-3.5 inline mr-1" />
                  请使用{channelLabel(selectedChannel)}扫一扫
                </p>
                {selectedChannel === 'mock' && (
                  <Button onClick={handleMockPay} className="w-full rounded-xl btn-brand gap-2 h-10">
                    <Sparkles className="h-4 w-4" />模拟支付成功
                  </Button>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

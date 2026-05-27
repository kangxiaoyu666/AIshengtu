'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Coins, Crown, RefreshCw, X, QrCode, Loader2, CheckCircle, Zap, CreditCard } from 'lucide-react';
import { rechargePackages } from '@/lib/wallet';

interface Balance { userId: string; balancePoints: number; totalRecharged: number; totalSpent: number; }
interface PayChannel { channelCode: string; channelName: string; status: string; }

export default function WalletPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('wechat');
  const [qrUrl, setQrUrl] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [paying, setPaying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paid, setPaid] = useState(false);
  const [packages, setPackages] = useState<any[]>(rechargePackages);
  const [payChannels, setPayChannels] = useState<PayChannel[]>([]);

  const userId = 'demo-user-1';

  const fetchBalance = useCallback(async () => {
    try {
      const r = await window.fetch(`/api/points/balance?userId=${userId}`);
      const d = await r.json();
      if (d.userId) setBalance(d);
    } catch {}
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  useEffect(() => {
    window.fetch('/api/cms/config').then(r => r.json()).then(d => {
      if (d.rechargePackages?.length) setPackages(d.rechargePackages);
    }).catch(() => {});
    window.fetch('/api/admin/payment-channels').then(r => r.json()).then(d => {
      const enabled = (d.channels || []).filter((c: PayChannel) => c.status === 'enabled');
      setPayChannels(enabled);
      if (enabled.length > 0) setSelectedChannel(enabled[0].channelCode);
    }).catch(() => {
      setPayChannels([{ channelCode: 'wechat', channelName: '微信支付', status: 'enabled' }]);
    });
  }, []);

  useEffect(() => {
    if (!orderNo || !polling || paid) return;
    const iv = setInterval(async () => {
      try {
        const r = await window.fetch(`/api/recharge/status?orderNo=${orderNo}`);
        const d = await r.json();
        if (d.status === 'paid') { setPaid(true); setPolling(false); toast.success(`+${d.points}点已到账`); fetchBalance();
          setTimeout(() => { setShowPay(false); setQrUrl(''); setOrderNo(''); setPaid(false); }, 2000); }
      } catch {}
    }, 2000);
    return () => clearInterval(iv);
  }, [orderNo, polling, paid, fetchBalance]);

  const handlePay = async (pkg: any) => {
    setSelectedPkg(pkg); setShowPay(true); setPaying(true); setQrUrl(''); setOrderNo(''); setPaid(false); setPolling(false);
    try {
      const r = await window.fetch('/api/recharge/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId: pkg.id, payChannel: selectedChannel }),
      });
      const d = await r.json();
      if (d.success) {
        setOrderNo(d.orderNo);
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(d.codeUrl)}`);
        if (d.testMode) {
          toast('测试模式', { action: { label: '模拟支付', onClick: () => { setPaid(true); toast.success('模拟成功'); fetchBalance(); } } });
        } else { setPolling(true); toast('请扫码支付', { description: '支付完成自动到账' }); }
      } else { toast.error(d.error || '创建订单失败'); setShowPay(false); }
    } catch { toast.error('网络错误'); setShowPay(false); }
    finally { setPaying(false); }
  };

  if (!balance) return (
    <div className="flex justify-center py-20 min-h-screen bg-[#0b1120]"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>
  );

  const channelLabel = (code: string) => code === 'wechat' ? '微信支付' : code === 'alipay' ? '支付宝' : code;

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Dark Gradient Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 mb-8 text-white shadow-2xl shadow-purple-500/20">
          <div className="absolute inset-0 bg-tech-grid opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4 backdrop-blur">
              <Coins className="h-8 w-8 text-yellow-300" /></div>
            <p className="text-sm text-white/60 mb-1">可用点数</p>
            <p className="text-5xl font-extrabold tracking-tight">{balance.balancePoints.toLocaleString()}</p>
            <div className="flex justify-center gap-8 mt-5 text-sm">
              <div><p className="text-white/50 text-xs mb-1">累计充值</p><p className="font-bold">{balance.totalRecharged.toLocaleString()} 点</p></div>
              <div className="w-px bg-white/20" />
              <div><p className="text-white/50 text-xs mb-1">累计消费</p><p className="font-bold">{balance.totalSpent.toLocaleString()} 点</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchBalance} className="mt-4 text-white/60 hover:text-white rounded-xl">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />刷新</Button>
          </div>
        </div>

        {/* Packages */}
        <h2 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-400" />充值套餐</h2>
        <p className="text-xs text-slate-500 mb-4">选择套餐和支付方式，扫码支付，自动到账</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {packages.map((pkg) => (
            <div key={pkg.id} onClick={() => handlePay(pkg)}
              className={`relative bg-white/5 border rounded-2xl p-4 cursor-pointer transition-all text-center ${
                pkg.popular ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1'
              }`}>
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-[10px] shadow-sm">
                  <Crown className="h-3 w-3 mr-0.5" />推荐</Badge>
              )}
              <Coins className={`h-8 w-8 mx-auto mb-2 ${pkg.popular ? 'text-blue-400' : 'text-slate-500'}`} />
              <p className="text-lg font-extrabold text-white">{pkg.points.toLocaleString()}</p>
              <p className="text-xs text-slate-500">点</p>
              <p className={`text-sm font-bold mt-2 ${pkg.popular ? 'text-blue-400' : 'text-slate-400'}`}>¥{pkg.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPay && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { if(!polling){setShowPay(false);setPolling(false);} }}>
          <Card className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {!paid && <button onClick={() => {setShowPay(false);setPolling(false)}}
              className="absolute top-3 right-3 p-2 rounded-xl hover:bg-red-50 text-slate-400"><X className="h-4 w-4"/></button>}
            {paid ? (
              <div className="py-8"><CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4"/><h3 className="text-xl font-extrabold text-slate-800">支付成功</h3><p className="text-sm text-slate-500">+{selectedPkg.points.toLocaleString()}点已到账</p></div>
            ) : paying ? (
              <div className="py-8"><Loader2 className="h-10 w-10 text-blue-400 mx-auto mb-3 animate-spin"/><p className="text-sm text-slate-500">创建订单中...</p></div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-800 mb-1">扫码支付</h3>
                <p className="text-sm text-blue-600 font-medium mb-1">{selectedPkg.points.toLocaleString()}点 · ¥{selectedPkg.price}</p>
                <div className="flex justify-center gap-2 mb-4">
                  {payChannels.map(ch => (
                    <button key={ch.channelCode} onClick={() => setSelectedChannel(ch.channelCode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        selectedChannel === ch.channelCode ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-500 border-slate-200'
                      }`}><CreditCard className="h-3 w-3"/>{ch.channelName}</button>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 mb-4 mx-auto w-[250px] h-[250px] flex items-center justify-center border border-slate-200">
                  {qrUrl ? <img src={qrUrl} alt="二维码" className="w-full h-full"/> : <Loader2 className="h-8 w-8 text-slate-300 animate-spin"/>}
                </div>
                <p className="text-xs text-slate-400"><QrCode className="h-3.5 w-3.5 inline mr-1"/>请使用{channelLabel(selectedChannel)}扫一扫</p>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

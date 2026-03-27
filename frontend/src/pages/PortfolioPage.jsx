import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COIN_INFO = {
    'BINANCE:BTCUSDT': { label: 'Bitcoin',  ticker: 'BTC', color: '#f7931a', icon: '₿' },
    'BINANCE:ETHUSDT': { label: 'Ethereum', ticker: 'ETH', color: '#627eea', icon: 'Ξ' },
    'BINANCE:BNBUSDT': { label: 'BNB',      ticker: 'BNB', color: '#f3ba2f', icon: '◈' },
    'BINANCE:SOLUSDT': { label: 'Solana',   ticker: 'SOL', color: '#9945ff', icon: '◎' },
};
const STOCK_INFO = {
    'NVDA':  { label: 'NVIDIA',    color: '#76b900', icon: '🟢' },
    'TSLA':  { label: 'Tesla',     color: '#e31937', icon: '🔴' },
    'AAPL':  { label: 'Apple',     color: '#a8a8a8', icon: '🍎' },
    'MSFT':  { label: 'Microsoft', color: '#00a4ef', icon: '🔵' },
    'GOOGL': { label: 'Google',    color: '#4285f4', icon: '🔍' },
    'NFLX':  { label: 'Netflix',   color: '#e50914', icon: '🎬' },
    'AMZN':  { label: 'Amazon',    color: '#ff9900', icon: '📦' },
    'AMD':   { label: 'AMD',       color: '#ed1c24', icon: '💻' },
};

const getInfo = (symbol, assetType) =>
    assetType === 'COIN'
        ? (COIN_INFO[symbol] ?? { label: symbol, color: '#888', icon: '?' })
        : (STOCK_INFO[symbol] ?? { label: symbol, color: '#888', icon: '📈' });

const fmt = (n) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const COIN_SYMBOLS = Object.keys(COIN_INFO);
const STOCK_SYMBOLS = Object.keys(STOCK_INFO);

function PnlBadge({ pnlPct }) {
    const up = pnlPct >= 0;
    return (
        <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8125rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            background: up ? 'oklch(0.62 0.22 25 / 15%)' : 'oklch(0.55 0.18 260 / 15%)',
            color: up ? 'oklch(0.72 0.20 25)' : 'oklch(0.65 0.16 240)',
            border: `1px solid ${up ? 'oklch(0.62 0.22 25 / 30%)' : 'oklch(0.55 0.18 260 / 30%)'}`,
        }}>
            {up ? '▲' : '▼'} {Math.abs(pnlPct).toFixed(2)}%
        </span>
    );
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value } = payload[0];
        return (
            <div style={{
                background: 'oklch(0.115 0.010 255)',
                border: '1px solid oklch(0.24 0.012 255 / 60%)',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8125rem',
            }}>
                <p style={{ color: 'oklch(0.94 0.004 255)', marginBottom: 2 }}>{name}</p>
                <p style={{ color: 'oklch(0.76 0.155 55)' }}>${fmt(value)}</p>
            </div>
        );
    }
    return null;
};

function AddForm({ onAdd }) {
    const [form, setForm] = useState({ assetType: 'COIN', symbol: '', quantity: '', avgPrice: '' });

    const symbolOptions = form.assetType === 'COIN' ? COIN_SYMBOLS : STOCK_SYMBOLS;

    const handleChange = (k, v) =>
        setForm(prev => ({ ...prev, [k]: v, ...(k === 'assetType' ? { symbol: '' } : {}) }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.symbol || !form.quantity || !form.avgPrice) return;
        onAdd(form);
        setForm({ assetType: form.assetType, symbol: '', quantity: '', avgPrice: '' });
    };

    const inputStyle = {
        background: 'oklch(0.10 0.010 255)',
        border: '1px solid oklch(0.24 0.012 255 / 60%)',
        borderRadius: 6,
        padding: '8px 12px',
        color: 'oklch(0.94 0.004 255)',
        fontSize: '0.875rem',
        fontFamily: 'JetBrains Mono, monospace',
        outline: 'none',
        width: '100%',
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">보유 종목 추가</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 90 }}>
                        <label style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)' }}>유형</label>
                        <select value={form.assetType} onChange={e => handleChange('assetType', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="COIN">코인</option>
                            <option value="STOCK">주식</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                        <label style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)' }}>종목</label>
                        <select value={form.symbol} onChange={e => handleChange('symbol', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="">선택</option>
                            {symbolOptions.map(s => {
                                const info = getInfo(s, form.assetType);
                                return <option key={s} value={s}>{info.label} ({s})</option>;
                            })}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 110 }}>
                        <label style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)' }}>수량</label>
                        <input type="number" step="any" placeholder="0.5" value={form.quantity}
                            onChange={e => handleChange('quantity', e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130 }}>
                        <label style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)' }}>매수가 ($)</label>
                        <input type="number" step="any" placeholder="90000" value={form.avgPrice}
                            onChange={e => handleChange('avgPrice', e.target.value)} style={inputStyle} />
                    </div>
                    <button type="submit" style={{
                        padding: '8px 20px',
                        borderRadius: 6,
                        background: 'oklch(0.76 0.155 55)',
                        color: 'oklch(0.08 0.010 255)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor: 'pointer',
                        height: 38,
                        whiteSpace: 'nowrap',
                    }}>
                        + 추가
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}

function PortfolioPage() {
    const [holdings, setHoldings] = useState([]);
    const [coinPrices, setCoinPrices] = useState([]);
    const [stockPrices, setStockPrices] = useState([]);

    const fetchPrices = useCallback(() => {
        api.get('/api/trades/latest').then(res => setCoinPrices(res.data)).catch(() => {});
        api.get('/api/stocks/latest').then(res => setStockPrices(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        api.get('/api/portfolio').then(res => setHoldings(res.data)).catch(() => {});
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const getCurrentPrice = (symbol, assetType) => {
        const prices = assetType === 'COIN' ? coinPrices : stockPrices;
        return prices.find(p => p.symbol === symbol)?.price ?? null;
    };

    const handleAdd = async (form) => {
        try {
            const res = await api.post('/api/portfolio', {
                symbol: form.symbol,
                assetType: form.assetType,
                quantity: parseFloat(form.quantity),
                avgPrice: parseFloat(form.avgPrice),
            });
            setHoldings(prev => [...prev, res.data]);
        } catch (e) { console.error(e); }
    };

    const handleRemove = async (id) => {
        try {
            await api.delete(`/api/portfolio/${id}`);
            setHoldings(prev => prev.filter(h => h.id !== id));
        } catch (e) { console.error(e); }
    };

    // 수익률 계산
    const enriched = holdings.map(h => {
        const currentPrice = getCurrentPrice(h.symbol, h.assetType);
        const qty = parseFloat(h.quantity);
        const avg = parseFloat(h.avgPrice);
        const invested = qty * avg;
        const currentValue = currentPrice != null ? qty * currentPrice : null;
        const pnl = currentValue != null ? currentValue - invested : null;
        const pnlPct = pnl != null && invested > 0 ? (pnl / invested) * 100 : null;
        const info = getInfo(h.symbol, h.assetType);
        return { ...h, currentPrice, invested, currentValue, pnl, pnlPct, info };
    });

    const totalInvested = enriched.reduce((s, h) => s + h.invested, 0);
    const totalValue = enriched.reduce((s, h) => s + (h.currentValue ?? h.invested), 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    const pieData = enriched
        .filter(h => h.currentValue != null && h.currentValue > 0)
        .map(h => ({ name: h.info.label, value: h.currentValue, color: h.info.color }));

    if (holdings.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">포트폴리오</h2>
                <AddForm onAdd={handleAdd} />
                <Card>
                    <CardContent className="py-12 text-center" style={{ color: 'oklch(0.52 0.012 255)' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>◈</p>
                        <p>보유 종목이 없습니다.</p>
                        <p style={{ fontSize: '0.875rem', marginTop: 4 }}>위 폼에서 종목을 추가해보세요.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">포트폴리오</h2>

            <AddForm onAdd={handleAdd} />

            {/* 총 요약 */}
            <Card>
                <CardContent className="pt-5 pb-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: '총 투자금액', value: `$${fmt(totalInvested)}` },
                            { label: '현재 평가금액', value: `$${fmt(totalValue)}` },
                            { label: '손익', value: `${totalPnl >= 0 ? '+' : ''}$${fmt(totalPnl)}`,
                              color: totalPnl >= 0 ? 'oklch(0.72 0.20 25)' : 'oklch(0.65 0.16 240)' },
                            { label: '수익률', value: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
                              color: totalPnlPct >= 0 ? 'oklch(0.72 0.20 25)' : 'oklch(0.65 0.16 240)' },
                        ].map(item => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)', marginBottom: 4 }}>{item.label}</p>
                                <p style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    color: item.color ?? 'oklch(0.94 0.004 255)',
                                }}>
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 파이차트 */}
                {pieData.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">종목별 비중</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                                        paddingAngle={3} dataKey="value">
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} stroke="oklch(0.08 0.010 255)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(value) => (
                                            <span style={{ fontSize: '0.8125rem', color: 'oklch(0.70 0.008 255)' }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* 보유 종목 목록 */}
                <div className="space-y-3">
                    {enriched.map(h => (
                        <Card key={h.id} style={{ position: 'relative' }}>
                            <button
                                onClick={() => handleRemove(h.id)}
                                style={{
                                    position: 'absolute', top: 10, right: 12,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'oklch(0.38 0.012 255)', fontSize: '1rem',
                                    padding: 4,
                                }}
                                title="삭제"
                            >
                                ✕
                            </button>
                            <CardContent className="pt-4 pb-4 pr-10">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '1.25rem' }}>{h.info.icon}</span>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'oklch(0.94 0.004 255)' }}>
                                                {h.info.label}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)', fontFamily: 'JetBrains Mono, monospace' }}>
                                                {h.symbol}
                                            </p>
                                        </div>
                                    </div>
                                    {h.pnlPct != null && <PnlBadge pnlPct={h.pnlPct} />}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                    {[
                                        { label: '수량', value: h.quantity },
                                        { label: '매수가', value: `$${fmt(h.avgPrice)}` },
                                        { label: '현재가', value: h.currentPrice != null ? `$${fmt(h.currentPrice)}` : '-' },
                                    ].map(cell => (
                                        <div key={cell.label}>
                                            <p style={{ fontSize: '0.6875rem', color: 'oklch(0.45 0.010 255)', marginBottom: 2 }}>{cell.label}</p>
                                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: 'oklch(0.85 0.005 255)' }}>
                                                {cell.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {h.pnl != null && (
                                    <div style={{
                                        marginTop: 10,
                                        padding: '6px 10px',
                                        borderRadius: 6,
                                        background: h.pnl >= 0 ? 'oklch(0.62 0.22 25 / 8%)' : 'oklch(0.55 0.18 260 / 8%)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.8125rem',
                                        fontFamily: 'JetBrains Mono, monospace',
                                    }}>
                                        <span style={{ color: 'oklch(0.52 0.012 255)' }}>손익</span>
                                        <span style={{ color: h.pnl >= 0 ? 'oklch(0.72 0.20 25)' : 'oklch(0.65 0.16 240)', fontWeight: 600 }}>
                                            {h.pnl >= 0 ? '+' : ''}${fmt(h.pnl)}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PortfolioPage;

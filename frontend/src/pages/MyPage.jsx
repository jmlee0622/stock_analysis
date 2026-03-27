import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COIN_INFO = {
    'BINANCE:BTCUSDT':  { label: 'Bitcoin',   ticker: 'BTC',  color: '#f7931a', icon: '₿' },
    'BINANCE:ETHUSDT':  { label: 'Ethereum',  ticker: 'ETH',  color: '#627eea', icon: 'Ξ' },
    'BINANCE:BNBUSDT':  { label: 'BNB',       ticker: 'BNB',  color: '#f3ba2f', icon: '◈' },
    'BINANCE:SOLUSDT':  { label: 'Solana',    ticker: 'SOL',  color: '#9945ff', icon: '◎' },
    'BINANCE:XRPUSDT':  { label: 'XRP',       ticker: 'XRP',  color: '#00aae4', icon: '✕' },
    'BINANCE:DOGEUSDT': { label: 'Dogecoin',  ticker: 'DOGE', color: '#c2a633', icon: 'Ð' },
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

const RANGES = [
    { key: '1h', label: '1시간' },
    { key: '1d', label: '1일' },
    { key: '1w', label: '1주' },
    { key: '1m', label: '1달' },
    { key: '1y', label: '1년' },
];

const getInfo = (symbol, assetType) =>
    assetType === 'COIN'
        ? (COIN_INFO[symbol] ?? { label: symbol, color: '#888', icon: '?' })
        : (STOCK_INFO[symbol] ?? { label: symbol, color: '#888', icon: '📈' });

const formatTime = (isoString, range) => {
    const d = new Date(isoString);
    if (range === '1h' || range === '1d') return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
};

const SENTIMENT_COLOR = {
    POSITIVE: 'oklch(0.62 0.20 160)',
    NEGATIVE: 'oklch(0.62 0.22 25)',
    NEUTRAL:  'oklch(0.52 0.012 255)',
};

const TAB_STYLE = (active) => ({
    padding: '6px 18px',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? 'oklch(0.76 0.155 55)' : 'oklch(0.52 0.012 255)',
    background: active ? 'oklch(0.76 0.155 55 / 10%)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
});

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'oklch(0.115 0.010 255)',
                border: '1px solid oklch(0.24 0.012 255 / 60%)',
                borderRadius: 8,
                padding: '8px 12px',
            }}>
                <p style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)' }}>{label}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

/* ──────────────────────────────────────────────
   탭 1: 관심종목
────────────────────────────────────────────── */
function WatchlistTab({ watchlist, onRemove }) {
    const [coinPrices, setCoinPrices] = useState([]);
    const [stockPrices, setStockPrices] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [selectedAssetType, setSelectedAssetType] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState('1d');

    useEffect(() => {
        if (watchlist.size === 0) return;
        api.get('/api/trades/latest').then(res => setCoinPrices(res.data)).catch(() => {});
        api.get('/api/stocks/latest').then(res => setStockPrices(res.data)).catch(() => {});
    }, [watchlist]);

    const fetchChart = useCallback(async (symbol, assetType, range) => {
        setChartLoading(true);
        try {
            const endpoint = assetType === 'COIN'
                ? `/api/trades/history?symbol=${encodeURIComponent(symbol)}&range=${range}`
                : `/api/stocks/history?symbol=${symbol}&range=${range}`;
            const res = await api.get(endpoint);
            setChartData(res.data.map(item => ({ time: formatTime(item.tradeTime, range), price: item.price })));
        } catch (e) { console.error(e); }
        finally { setChartLoading(false); }
    }, []);

    const handleCardClick = (symbol, assetType) => {
        if (selectedSymbol === symbol) { setSelectedSymbol(null); setChartData([]); return; }
        setSelectedSymbol(symbol);
        setSelectedAssetType(assetType);
        fetchChart(symbol, assetType, selectedRange);
    };

    useEffect(() => {
        if (selectedSymbol) fetchChart(selectedSymbol, selectedAssetType, selectedRange);
    }, [selectedRange, selectedSymbol, selectedAssetType, fetchChart]);

    const symbols = [...watchlist];
    const mergePrice = (syms, prices, assetType) =>
        syms.map(symbol => {
            const p = prices.find(x => x.symbol === symbol);
            return { symbol, assetType, price: p?.price ?? null, changePct: p?.changePct ?? 0 };
        });

    const coins  = mergePrice(symbols.filter(s => s.startsWith('BINANCE:')), coinPrices, 'COIN');
    const stocks = mergePrice(symbols.filter(s => !s.startsWith('BINANCE:')), stockPrices, 'STOCK');
    const all    = [...coins, ...stocks];

    const selectedInfo = selectedSymbol ? getInfo(selectedSymbol, selectedAssetType) : null;

    if (all.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center" style={{ color: 'oklch(0.52 0.012 255)' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>☆</p>
                    <p>관심종목이 없습니다.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: 4 }}>코인·주식 카드의 ☆ 버튼으로 추가해보세요.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {all.map(item => {
                    const info = getInfo(item.symbol, item.assetType);
                    const isUp = item.changePct >= 0;
                    const isSelected = selectedSymbol === item.symbol;
                    return (
                        <Card key={item.symbol} onClick={() => handleCardClick(item.symbol, item.assetType)}
                            style={{ cursor: 'pointer', position: 'relative',
                                outline: isSelected ? '2px solid oklch(0.76 0.155 55)' : 'none',
                                transition: 'all 0.15s' }}>
                            <button onClick={e => { e.stopPropagation(); onRemove(item.symbol); }}
                                style={{ position: 'absolute', top: 10, right: 12, background: 'none',
                                    border: 'none', cursor: 'pointer', color: 'oklch(0.76 0.155 55)', fontSize: '1.125rem' }}>
                                ★
                            </button>
                            <CardHeader className="pb-2 pr-10">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{info.label}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)', fontFamily: 'JetBrains Mono, monospace' }}>{item.symbol}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {item.price != null ? (
                                    <>
                                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: info.color }}>
                                            ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)}
                                        </p>
                                        <span style={{ fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace',
                                            color: isUp ? 'oklch(0.72 0.20 25)' : 'oklch(0.65 0.16 240)' }}>
                                            {isUp ? '▲' : '▼'} {Math.abs(item.changePct).toFixed(2)}%
                                        </span>
                                        <p style={{ fontSize: '0.75rem', color: 'oklch(0.76 0.155 55 / 70%)', marginTop: 6 }}>클릭하여 차트 보기 →</p>
                                    </>
                                ) : (
                                    <p style={{ fontSize: '0.875rem', color: 'oklch(0.52 0.012 255)' }}>가격 정보 없음</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selectedSymbol && (
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{selectedInfo?.icon}</span> {selectedInfo?.label} 가격 추이
                            </CardTitle>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', gap: 2, background: 'oklch(0.17 0.010 255)', borderRadius: 8, padding: 4 }}>
                                    {RANGES.map(r => (
                                        <button key={r.key} onClick={() => setSelectedRange(r.key)}
                                            style={{ padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                                background: selectedRange === r.key ? 'oklch(0.115 0.010 255)' : 'transparent',
                                                color: selectedRange === r.key ? 'oklch(0.94 0.004 255)' : 'oklch(0.52 0.012 255)',
                                            }}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => { setSelectedSymbol(null); setChartData([]); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'oklch(0.52 0.012 255)', fontSize: '0.875rem' }}>✕</button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {chartLoading ? (
                            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.52 0.012 255)' }}>차트 불러오는 중...</div>
                        ) : chartData.length === 0 ? (
                            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.52 0.012 255)' }}>데이터가 없습니다</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="mypageGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={selectedInfo?.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={selectedInfo?.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.20 0.010 255)" />
                                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'oklch(0.52 0.012 255)' }} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontSize: 11, fill: 'oklch(0.52 0.012 255)', fontFamily: 'JetBrains Mono, monospace' }}
                                        tickFormatter={v => `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)}`}
                                        domain={['auto', 'auto']} width={80} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="price" stroke={selectedInfo?.color} strokeWidth={2} fill="url(#mypageGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   탭 2: 뉴스 스크랩
────────────────────────────────────────────── */
function NewsScrapsTab({ savedNews, onMarkRead, onRemove }) {
    if (savedNews.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center" style={{ color: 'oklch(0.52 0.012 255)' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔖</p>
                    <p>스크랩한 뉴스가 없습니다.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: 4 }}>뉴스 탭에서 기사를 저장해보세요.</p>
                </CardContent>
            </Card>
        );
    }

    const unread = savedNews.filter(n => !n.isRead).length;

    return (
        <div className="space-y-3">
            {unread > 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'oklch(0.76 0.155 55)', fontFamily: 'JetBrains Mono, monospace' }}>
                    안읽음 {unread}개
                </p>
            )}
            {savedNews.map(article => (
                <Card key={article.newsId} style={{ opacity: article.isRead ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <CardContent className="pt-4 pb-4">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                    {!article.isRead && (
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: 'oklch(0.76 0.155 55)',
                                            boxShadow: '0 0 6px oklch(0.76 0.155 55 / 80%)',
                                            flexShrink: 0, display: 'inline-block',
                                        }} />
                                    )}
                                    <span style={{
                                        fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em',
                                        color: SENTIMENT_COLOR[article.sentiment] ?? 'oklch(0.52 0.012 255)',
                                        fontFamily: 'JetBrains Mono, monospace',
                                    }}>
                                        {article.sentiment}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'oklch(0.45 0.010 255)' }}>{article.source}</span>
                                </div>
                                <a href={article.url} target="_blank" rel="noreferrer"
                                    onClick={() => !article.isRead && onMarkRead(article.newsId)}
                                    style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'oklch(0.94 0.004 255)',
                                        textDecoration: 'none', display: 'block', marginBottom: 4,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {article.headline}
                                </a>
                                <p style={{ fontSize: '0.75rem', color: 'oklch(0.45 0.010 255)', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {new Date(article.savedAt).toLocaleDateString('ko-KR')}
                                </p>
                            </div>
                            <button onClick={() => onRemove(article.newsId)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'oklch(0.38 0.012 255)', fontSize: '0.875rem', flexShrink: 0, padding: '2px 4px' }}>
                                ✕
                            </button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────
   탭 3: 최근 본 종목
────────────────────────────────────────────── */
function RecentViewsTab({ recentViews }) {
    if (recentViews.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center" style={{ color: 'oklch(0.52 0.012 255)' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🕐</p>
                    <p>최근 본 종목이 없습니다.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: 4 }}>코인·주식 차트를 클릭하면 자동으로 기록됩니다.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-2">
            {recentViews.map((item, i) => {
                const info = getInfo(item.symbol, item.assetType);
                return (
                    <Card key={item.symbol}>
                        <CardContent className="py-3 px-4">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
                                        color: 'oklch(0.38 0.012 255)', width: 20, textAlign: 'right' }}>
                                        {i + 1}
                                    </span>
                                    <span style={{ fontSize: '1.125rem' }}>{info.icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'oklch(0.94 0.004 255)' }}>{info.label}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'oklch(0.52 0.012 255)', fontFamily: 'JetBrains Mono, monospace' }}>{item.symbol}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'oklch(0.45 0.010 255)', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {new Date(item.viewedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

/* ──────────────────────────────────────────────
   메인 MyPage
────────────────────────────────────────────── */
const TABS = [
    { key: 'watchlist',   label: '★ 관심종목' },
    { key: 'news-scraps', label: '🔖 뉴스 스크랩' },
    { key: 'recent',      label: '🕐 최근 본 종목' },
];

function MyPage({ watchlist, onRemove, savedNews, onMarkRead, onRemoveNews, recentViews }) {
    const [activeTab, setActiveTab] = useState('watchlist');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">마이페이지</h2>

            {/* 탭 바 */}
            <div style={{
                display: 'flex',
                gap: 4,
                borderBottom: '1px solid oklch(0.24 0.012 255 / 60%)',
                paddingBottom: 0,
            }}>
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        style={{
                            ...TAB_STYLE(activeTab === tab.key),
                            borderBottom: activeTab === tab.key ? '2px solid oklch(0.76 0.155 55)' : '2px solid transparent',
                            borderRadius: 0,
                            paddingBottom: 10,
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'watchlist'   && <WatchlistTab watchlist={watchlist} onRemove={onRemove} />}
            {activeTab === 'news-scraps' && <NewsScrapsTab savedNews={savedNews} onMarkRead={onMarkRead} onRemove={onRemoveNews} />}
            {activeTab === 'recent'      && <RecentViewsTab recentViews={recentViews} />}
        </div>
    );
}

export default MyPage;

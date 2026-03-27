import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const FNG_LEVELS = [
    { max: 24,  label: '극도 공포', color: '#ef4444' },
    { max: 44,  label: '공포',      color: '#f97316' },
    { max: 55,  label: '중립',      color: '#eab308' },
    { max: 74,  label: '탐욕',      color: '#22c55e' },
    { max: 100, label: '극도 탐욕', color: '#10b981' },
];

const getFngLevel = (value) => FNG_LEVELS.find(l => value <= l.max) ?? FNG_LEVELS[4];

function FearGreedWidget() {
    const [fng, setFng] = useState(null);

    useEffect(() => {
        fetch('https://api.alternative.me/fng/')
            .then(res => res.json())
            .then(json => setFng(json.data[0]))
            .catch(() => {});
    }, []);

    if (!fng) return null;

    const value = parseInt(fng.value);
    const level = getFngLevel(value);

    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">공포·탐욕 지수</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold" style={{ color: level.color }}>{value}</span>
                        <span className="text-sm font-medium" style={{ color: level.color }}>{level.label}</span>
                    </div>
                </div>
                <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted">
                    {/* 그라디언트 배경 */}
                    <div className="absolute inset-0 rounded-full"
                        style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #10b981)' }}
                    />
                    {/* 포인터 */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-500"
                        style={{ left: `calc(${value / 100} * (100% - 16px))`, backgroundColor: level.color }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>극도 공포</span>
                    <span>중립</span>
                    <span>극도 탐욕</span>
                </div>
            </CardContent>
        </Card>
    );
}

const SYMBOLS = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'];

const COIN_INFO = {
    'BINANCE:BTCUSDT':  { label: 'Bitcoin',   ticker: 'BTC',  color: '#f7931a', icon: '₿' },
    'BINANCE:ETHUSDT':  { label: 'Ethereum',  ticker: 'ETH',  color: '#627eea', icon: 'Ξ' },
    'BINANCE:BNBUSDT':  { label: 'BNB',       ticker: 'BNB',  color: '#f3ba2f', icon: '◈' },
    'BINANCE:SOLUSDT':  { label: 'Solana',    ticker: 'SOL',  color: '#9945ff', icon: '◎' },
    'BINANCE:XRPUSDT':  { label: 'XRP',       ticker: 'XRP',  color: '#00aae4', icon: '✕' },
    'BINANCE:DOGEUSDT': { label: 'Dogecoin',  ticker: 'DOGE', color: '#c2a633', icon: 'Ð' },
    'BINANCE:ADAUSDT':  { label: 'Cardano',   ticker: 'ADA',  color: '#0033ad', icon: '₳' },
    'BINANCE:AVAXUSDT': { label: 'Avalanche', ticker: 'AVAX', color: '#e84142', icon: '🔺' },
};

function PriceCard({ item, onClick, isSelected, isBookmarked, onToggleBookmark }) {
    const info = COIN_INFO[item.symbol] ?? { label: item.symbol, ticker: '', color: '#888', icon: '?' };
    const isUp = item.changePct >= 0;

    const handleBookmark = (e) => {
        e.stopPropagation();
        onToggleBookmark(item.symbol, 'COIN');
    };

    return (
        <Card
            onClick={() => onClick(item.symbol)}
            className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg
                ${isSelected ? 'ring-2 ring-primary' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                            <CardTitle className="text-base">{info.label}</CardTitle>
                            <p className="text-xs text-muted-foreground">{info.ticker}/USDT</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBookmark}
                            className={`text-xl leading-none transition-colors ${isBookmarked ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
                            title={isBookmarked ? '관심종목 해제' : '관심종목 추가'}
                        >
                            {isBookmarked ? '★' : '☆'}
                        </button>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${isUp ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {isUp ? '▲' : '▼'} {Math.abs(item.changePct).toFixed(2)}%
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold tracking-tight" style={{ color: info.color }}>
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)}
                </p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span className={isUp ? 'text-red-400' : 'text-blue-400'}>
                        {isUp ? '+' : ''}{item.change?.toFixed(2)} 24시간
                    </span>
                    <span>고: ${item.high?.toFixed(2)} · 저: ${item.low?.toFixed(2)}</span>
                </div>
                <p className="text-xs text-primary mt-2">클릭하여 차트 보기 →</p>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">
                    ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        );
    }
    return null;
};

const RANGES = [
    { key: '1h', label: '1시간' },
    { key: '1d', label: '1일' },
    { key: '1w', label: '1주' },
    { key: '1m', label: '1달' },
    { key: '1y', label: '1년' },
];

const formatTime = (isoString, range) => {
    const d = new Date(isoString);
    if (range === '1h') return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    if (range === '1d') return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    if (range === '1w') return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
};

function PricePage({ watchlist = new Set(), onToggleWatchlist = () => {}, onViewSymbol = () => {} }) {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState('1h');

    const fetchPrices = useCallback(async () => {
        try {
            const res = await api.get('/api/trades/latest');
            setPrices(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchChart = useCallback(async (symbol, range) => {
        setChartLoading(true);
        try {
            const res = await api.get(`/api/trades/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);
            const data = res.data.map((item) => ({
                time: formatTime(item.tradeTime, range),
                price: item.price,
            }));
            setChartData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setChartLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 5000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    useEffect(() => {
        if (selectedSymbol) fetchChart(selectedSymbol, selectedRange);
    }, [selectedRange, selectedSymbol, fetchChart]);

    const handleCardClick = (symbol) => {
        if (selectedSymbol === symbol) {
            setSelectedSymbol(null);
            setChartData([]);
        } else {
            setSelectedSymbol(symbol);
            fetchChart(symbol, selectedRange);
            onViewSymbol(symbol, 'COIN');
        }
    };

    const handleRangeChange = (range) => {
        setSelectedRange(range);
    };

    const selectedInfo = selectedSymbol ? COIN_INFO[selectedSymbol] : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">실시간 시세</h2>
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    5초마다 자동 갱신
                </span>
            </div>

            <FearGreedWidget />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prices.map((item) => (
                        <PriceCard
                            key={item.symbol}
                            item={item}
                            onClick={handleCardClick}
                            isSelected={selectedSymbol === item.symbol}
                            isBookmarked={watchlist.has(item.symbol)}
                            onToggleBookmark={onToggleWatchlist}
                        />
                    ))}
                </div>
            )}

            {selectedSymbol && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <span>{selectedInfo?.icon}</span>
                                {selectedInfo?.label} 가격 추이
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1 bg-muted rounded-lg p-1">
                                    {RANGES.map((r) => (
                                        <button
                                            key={r.key}
                                            onClick={() => handleRangeChange(r.key)}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
                                                ${selectedRange === r.key
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => { setSelectedSymbol(null); setChartData([]); }}
                                    className="text-muted-foreground hover:text-foreground text-sm"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {chartLoading ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                차트 불러오는 중...
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                데이터가 없습니다
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedInfo?.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={selectedInfo?.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 12, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
                                        interval={selectedRange === '1w' ? 23 : selectedRange === '1m' ? 5 : 'preserveStartEnd'}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 13, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
                                        tickFormatter={(v) =>
                                            `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`
                                        }
                                        domain={['auto', 'auto']}
                                        width={110}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={selectedInfo?.color}
                                        strokeWidth={2}
                                        fill="url(#colorPrice)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            <CryptoNewsFeed />
        </div>
    );
}

const SENTIMENT_VARIANT = {
    POSITIVE: 'default',
    NEGATIVE: 'destructive',
    NEUTRAL: 'secondary',
};

const stripHtml = (html) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
};

function CryptoNewsFeed() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        api.get('/api/news?limit=5')
            .then(res => setNews(res.data.slice(0, 5)))
            .catch(() => {});
    }, []);

    if (news.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">최근 코인 뉴스</h3>
            {news.map((article, idx) => (
                <Card key={article.newsId ?? idx} className="hover:bg-accent/30 transition-colors">
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={SENTIMENT_VARIANT[article.sentiment] ?? 'secondary'}>
                                {article.sentiment}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{article.source}</span>
                        </div>
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors block mb-1"
                        >
                            {article.headline}
                        </a>
                        <p className="text-xs text-muted-foreground">{stripHtml(article.summary)}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default PricePage;

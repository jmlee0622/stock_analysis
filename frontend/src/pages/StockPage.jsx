import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';

const STOCK_INFO = {
    'NVDA':  { label: 'NVIDIA',     color: '#76b900', icon: '🟢', sector: '테크' },
    'TSLA':  { label: 'Tesla',      color: '#e31937', icon: '🔴', sector: 'EV/자동차' },
    'AAPL':  { label: 'Apple',      color: '#a8a8a8', icon: '🍎', sector: '테크' },
    'MSFT':  { label: 'Microsoft',  color: '#00a4ef', icon: '🔵', sector: '테크' },
    'GOOGL': { label: 'Google',     color: '#4285f4', icon: '🔍', sector: '테크' },
    'NFLX':  { label: 'Netflix',    color: '#e50914', icon: '🎬', sector: '소비재' },
    'AMZN':  { label: 'Amazon',     color: '#ff9900', icon: '📦', sector: '소비재' },
    'AMD':   { label: 'AMD',        color: '#ed1c24', icon: '💻', sector: '테크' },
};

// 시가총액 (단위: 억 달러, 상대 비율용 - 자주 바뀌지 않아 하드코딩)
const MARKET_CAP = {
    'NVDA':  33000,
    'AAPL':  35000,
    'MSFT':  30000,
    'GOOGL': 21000,
    'AMZN':  23000,
    'TSLA':   8000,
    'NFLX':   4000,
    'AMD':    2500,
};

const getHeatColor = (changePct) => {
    if (changePct >=  3) return '#b91c1c';  // 짙은 빨강
    if (changePct >=  1) return '#f87171';  // 연한 빨강
    if (changePct >= -1) return '#6b7280';  // 회색
    if (changePct >= -3) return '#60a5fa';  // 연한 파랑
    return '#1d4ed8';                        // 짙은 파랑
};

const getTextColor = (changePct) => {
    if (Math.abs(changePct) < 1) return '#e5e7eb';
    return '#ffffff';
};

function SectorHeatmap({ stocks }) {
    const containerRef = useRef(null);
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        if (!containerRef.current || stocks.length === 0) return;

        const width  = containerRef.current.offsetWidth;
        const height = 280;

        // 섹터별 그룹핑
        const sectorMap = {};
        stocks.forEach(s => {
            const info = STOCK_INFO[s.symbol];
            if (!info) return;
            if (!sectorMap[info.sector]) sectorMap[info.sector] = [];
            sectorMap[info.sector].push({
                name:      s.symbol,
                label:     info.label,
                value:     MARKET_CAP[s.symbol] ?? 1000,
                changePct: s.changePct,
                change:    s.change,
            });
        });

        const data = {
            name: 'root',
            children: Object.entries(sectorMap).map(([sector, children]) => ({
                name: sector,
                children,
            })),
        };

        const root = hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        treemap()
            .tile(treemapSquarify)
            .size([width, height])
            .paddingOuter(6)
            .paddingTop(22)
            .paddingInner(3)
            (root);

        setLeaves(root.descendants().filter(d => d.depth > 0));
    }, [stocks]);

    if (stocks.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">섹터 히트맵</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#b91c1c]" /> +3%↑
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#f87171]" /> +1~3%
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#6b7280]" /> 0%
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#60a5fa]" /> -1~3%
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#1d4ed8]" /> -3%↓
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} style={{ position: 'relative', height: 280 }}>
                    {leaves.map((node, i) => {
                        const w = node.x1 - node.x0;
                        const h = node.y1 - node.y0;
                        // 섹터 레이블 노드 (depth=1)
                        if (node.depth === 1) {
                            return (
                                <div key={`sector-${i}`} style={{
                                    position: 'absolute',
                                    left:   node.x0,
                                    top:    node.y0,
                                    width:  w,
                                    height: h,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6,
                                    pointerEvents: 'none',
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        top: 4, left: 6,
                                        fontSize: 11,
                                        color: 'rgba(255,255,255,0.5)',
                                        fontWeight: 600,
                                        userSelect: 'none',
                                    }}>
                                        {node.data.name}
                                    </span>
                                </div>
                            );
                        }
                        // 종목 노드 (depth=2)
                        const { name, label, changePct, change } = node.data;
                        const symFontSize    = Math.max(9,  Math.min(14, w / 4, h / 3));
                        const pctFontSize    = Math.max(8,  Math.min(12, w / 5, h / 4));
                        const showLabel      = w > 22 && h > 18;
                        const showChange     = w > 32 && h > 32;
                        return (
                            <div key={name} style={{
                                position:        'absolute',
                                left:            node.x0,
                                top:             node.y0,
                                width:           w,
                                height:          h,
                                backgroundColor: getHeatColor(changePct),
                                borderRadius:    4,
                                display:         'flex',
                                flexDirection:   'column',
                                alignItems:      'center',
                                justifyContent:  'center',
                                cursor:          'default',
                                overflow:        'hidden',
                                transition:      'filter 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            title={`${label} (${name})\n${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`}
                            >
                                {showLabel && (
                                    <span style={{
                                        fontSize:   symFontSize,
                                        fontWeight: 700,
                                        color:      getTextColor(changePct),
                                        lineHeight: 1.2,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {name}
                                    </span>
                                )}
                                {showChange && (
                                    <span style={{
                                        fontSize:  pctFontSize,
                                        color:     getTextColor(changePct),
                                        opacity:   0.9,
                                        marginTop: 2,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

const SECTORS = ['전체', '테크', '소비재', 'EV/자동차'];

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

// 미국 장 상태 계산 (ET 기준 평일 09:30~16:00)
const getMarketStatus = () => {
    const now = new Date();
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = et.getDay();
    const hour = et.getHours();
    const min = et.getMinutes();
    const time = hour * 60 + min;

    if (day === 0 || day === 6) return { open: false, label: '주말 휴장' };
    if (time >= 9 * 60 + 30 && time < 16 * 60) return { open: true, label: '장 운영 중' };
    if (time < 9 * 60 + 30) return { open: false, label: `장 시작까지 ${9 * 60 + 30 - time}분` };
    return { open: false, label: '장 마감' };
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

// 주요 지수 바
function IndicesBar() {
    const [indices, setIndices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = () =>
            api.get('/api/stocks/indices')
                .then(res => { setIndices(res.data); setLoading(false); })
                .catch(() => setLoading(false));
        fetch();
        const interval = setInterval(fetch, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <Card className="animate-pulse"><CardContent className="h-24" /></Card>;
    if (indices.length === 0) return null;

    const upCount = indices.filter(i => i.changePct >= 0).length;
    const marketMood =
        upCount === 3 ? '전체 강세' :
        upCount === 0 ? '전체 약세' :
        upCount >= 2  ? '강세 우세' : '약세 우세';

    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold">주요 지수</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                        ${upCount >= 2 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {upCount >= 2 ? '📈' : '📉'} {marketMood}
                    </span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border">
                    {indices.map((idx) => {
                        const isUp = idx.changePct >= 0;
                        return (
                            <div key={idx.symbol} className="px-4 first:pl-0 last:pr-0">
                                <p className="text-xs text-muted-foreground mb-1">{idx.symbol}</p>
                                <p className="text-2xl font-bold tabular-nums">
                                    {new Intl.NumberFormat('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(idx.price)}
                                </p>
                                <div className={`flex items-center gap-1 mt-1.5 text-sm font-medium
                                    ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                                    <span>{isUp ? '▲' : '▼'}</span>
                                    <span>{isUp ? '+' : ''}{idx.change?.toFixed(2) ?? '–'}</span>
                                    <span className="text-xs opacity-80">
                                        ({isUp ? '+' : ''}{idx.changePct.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function StockCard({ item, onClick, isSelected, isBookmarked, onToggleBookmark }) {
    const info = STOCK_INFO[item.symbol] ?? { label: item.symbol, color: '#888', icon: '📈', sector: '' };
    const isUp = item.changePct >= 0;

    const handleBookmark = (e) => {
        e.stopPropagation();
        onToggleBookmark(item.symbol, 'STOCK');
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
                        <span className="text-xl">{info.icon}</span>
                        <div>
                            <CardTitle className="text-base">{info.label}</CardTitle>
                            <p className="text-xs text-muted-foreground">{item.symbol} · {info.sector}</p>
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
                <p className={`text-3xl font-bold tracking-tight ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price)}
                </p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span className={isUp ? 'text-red-400' : 'text-blue-400'}>
                        {isUp ? '+' : ''}{item.change.toFixed(2)} 오늘
                    </span>
                    <span>고: ${item.high.toFixed(2)} · 저: ${item.low.toFixed(2)}</span>
                </div>
                <p className="text-xs text-primary mt-2">클릭하여 차트 보기 →</p>
            </CardContent>
        </Card>
    );
}

function StockPage({ watchlist = new Set(), onToggleWatchlist = () => {}, onViewSymbol = () => {} }) {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState('1d');
    const [selectedSector, setSelectedSector] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const marketStatus = getMarketStatus();

    const fetchStocks = useCallback(async () => {
        try {
            const res = await api.get('/api/stocks/latest');
            setStocks(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchChart = useCallback(async (symbol, range) => {
        setChartLoading(true);
        try {
            const res = await api.get(`/api/stocks/history?symbol=${symbol}&range=${range}`);
            setChartData(res.data.map(item => ({
                time: formatTime(item.tradeTime, range),
                price: item.price,
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setChartLoading(false);
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchResult(null);
        try {
            const res = await api.get(`/api/stocks/latest`);
            const found = res.data.find(s => s.symbol.toUpperCase() === searchQuery.toUpperCase());
            if (found) {
                setSearchResult(found);
            } else {
                setSearchResult({ notFound: true });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
        const interval = setInterval(fetchStocks, 30000);
        return () => clearInterval(interval);
    }, [fetchStocks]);

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
            onViewSymbol(symbol, 'STOCK');
        }
    };

    const filteredStocks = stocks.filter(s => {
        if (selectedSector === '전체') return true;
        return STOCK_INFO[s.symbol]?.sector === selectedSector;
    });

    const selectedInfo = selectedSymbol ? (STOCK_INFO[selectedSymbol] ?? { label: selectedSymbol, color: '#888', icon: '📈' }) : null;

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">미국 주식</h2>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${marketStatus.open ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                        {marketStatus.open ? '🟢' : '🔴'} {marketStatus.label}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        30초마다 자동 갱신
                    </span>
                </div>
            </div>

            {/* 주요 지수 */}
            <IndicesBar />

            {/* 종목 검색 */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="종목 검색 (예: NVDA, AAPL...)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                />
                <Button type="submit" variant="outline" disabled={searchLoading}>
                    {searchLoading ? '검색 중...' : '검색'}
                </Button>
            </form>

            {searchResult && (
                searchResult.notFound
                    ? <p className="text-sm text-muted-foreground">목록에 없는 종목이에요.</p>
                    : <StockCard item={searchResult} onClick={handleCardClick} isSelected={selectedSymbol === searchResult.symbol}
                        isBookmarked={watchlist.has(searchResult.symbol)} onToggleBookmark={onToggleWatchlist} />
            )}

            {/* 섹터 필터 */}
            <div className="flex gap-2 flex-wrap">
                {SECTORS.map(sector => (
                    <button
                        key={sector}
                        onClick={() => setSelectedSector(sector)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                            ${selectedSector === sector
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                    >
                        {sector}
                    </button>
                ))}
            </div>

            {/* 종목 카드 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStocks.map(item => (
                        <StockCard key={item.symbol} item={item} onClick={handleCardClick} isSelected={selectedSymbol === item.symbol}
                            isBookmarked={watchlist.has(item.symbol)} onToggleBookmark={onToggleWatchlist} />
                    ))}
                </div>
            )}

            {/* 섹터 히트맵 */}
            {!loading && <SectorHeatmap stocks={stocks} />}

            {/* 차트 */}
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
                                    {RANGES.map(r => (
                                        <button
                                            key={r.key}
                                            onClick={() => setSelectedRange(r.key)}
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
                                <button onClick={() => { setSelectedSymbol(null); setChartData([]); }}
                                    className="text-muted-foreground hover:text-foreground text-sm">✕</button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {chartLoading ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">차트 불러오는 중...</div>
                        ) : chartData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">데이터가 없습니다</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="stockColorPrice" x1="0" y1="0" x2="0" y2="1">
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
                                        tickFormatter={v => `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`}
                                        domain={['auto', 'auto']}
                                        width={110}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="price"
                                        stroke={selectedInfo?.color} strokeWidth={2}
                                        fill="url(#stockColorPrice)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default StockPage;

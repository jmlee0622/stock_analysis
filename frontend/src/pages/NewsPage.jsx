import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
    { key: '전체', label: '전체' },
    { key: 'CRYPTO', label: '코인' },
    { key: 'STOCK', label: '주식' },
];

const SENTIMENTS = [
    { key: '전체', label: '전체' },
    { key: 'POSITIVE', label: '긍정' },
    { key: 'NEGATIVE', label: '부정' },
    { key: 'NEUTRAL', label: '중립' },
];

const SENTIMENT_VARIANT = {
    POSITIVE: 'default',
    NEGATIVE: 'destructive',
    NEUTRAL: 'secondary',
};

const SENTIMENT_COLOR = {
    POSITIVE: 'text-green-400',
    NEGATIVE: 'text-red-400',
    NEUTRAL: 'text-muted-foreground',
};

const stripHtml = (html) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 200 ? text.slice(0, 200) + '...' : text;
};

function NewsPage({ savedNewsIds = new Set(), onToggleSave = () => {} }) {
    const [news, setNews] = useState([]);
    const [category, setCategory] = useState('전체');
    const [sentiment, setSentiment] = useState('전체');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const params = {};
                if (category !== '전체') params.category = category;
                if (sentiment !== '전체') params.sentiment = sentiment;
                const res = await api.get('/api/news', { params });
                setNews(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [category, sentiment]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">뉴스 감성 분석</h2>

            {/* 카테고리 필터 */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">카테고리</span>
                <div className="flex gap-2">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c.key}
                            onClick={() => setCategory(c.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                ${category === c.key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 감성 필터 */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">감성</span>
                <div className="flex gap-2">
                    {SENTIMENTS.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setSentiment(s.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                ${sentiment === s.key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-24 pt-6" />
                        </Card>
                    ))}
                </div>
            ) : news.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">뉴스가 없습니다.</p>
            ) : (
                <div className="space-y-3">
                    {news.map((article, idx) => {
                        const isSaved = savedNewsIds.has(article.newsId);
                        return (
                        <Card key={article.newsId ?? idx} className="hover:bg-accent/30 transition-colors">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={SENTIMENT_VARIANT[article.sentiment] ?? 'secondary'}>
                                            {article.sentiment}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {article.category === 'CRYPTO' ? '코인' : article.category === 'STOCK' ? '주식' : article.category}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{article.source}</span>
                                    </div>
                                    <button
                                        onClick={() => onToggleSave(article)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: '1.125rem', padding: '2px 4px',
                                            color: isSaved ? 'oklch(0.76 0.155 55)' : 'oklch(0.38 0.012 255)',
                                            transition: 'color 0.15s',
                                        }}
                                        title={isSaved ? '스크랩 해제' : '스크랩'}
                                    >
                                        {isSaved ? '🔖' : '🔗'}
                                    </button>
                                </div>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-foreground hover:text-primary transition-colors block mb-1"
                                >
                                    {article.headline}
                                </a>
                                <p className="text-sm text-muted-foreground">{stripHtml(article.summary)}</p>
                                {article.sentimentReason && (
                                    <p className={`text-xs mt-2 ${SENTIMENT_COLOR[article.sentiment] ?? 'text-muted-foreground'}`}>
                                        💬 {article.sentimentReason}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default NewsPage;

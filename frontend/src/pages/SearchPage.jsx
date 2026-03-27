import { useState } from 'react';
import api from '../api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SENTIMENT_VARIANT = {
    POSITIVE: 'default',
    NEGATIVE: 'destructive',
    NEUTRAL: 'secondary',
};

const scoreColor = (score) => {
    if (score >= 0.85) return 'text-green-400';
    if (score >= 0.70) return 'text-yellow-400';
    return 'text-muted-foreground';
};

function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await api.get('/api/news/search', { params: { q: query, limit: 10 } });
            setResults(res.data.filter(item => item.url));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">뉴스 유사도 검색</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    키워드를 입력하면 의미적으로 유사한 뉴스를 찾아드립니다.
                </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    type="text"
                    placeholder="예: bitcoin crash, ethereum regulation..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? '검색 중...' : '검색'}
                </Button>
            </form>

            {!loading && searched && results.length === 0 && (
                <p className="text-muted-foreground text-center py-12">검색 결과가 없습니다.</p>
            )}

            {!loading && results.length > 0 && (
                <div className="space-y-3">
                    {results.map((item, idx) => (
                        <Card key={idx} className="hover:bg-accent/30 transition-colors">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={SENTIMENT_VARIANT[item.sentiment] ?? 'secondary'}>
                                        {item.sentiment}
                                    </Badge>
                                    <span className={`text-xs font-medium ${scoreColor(item.score)}`}>
                                        유사도 {(item.score * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-foreground hover:text-primary transition-colors block"
                                >
                                    {item.headline}
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchPage;

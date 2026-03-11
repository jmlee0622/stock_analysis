import { useEffect, useState } from 'react';
import api from '../api/axios';
import './NewsPage.css';

const SENTIMENTS = ['전체', 'POSITIVE', 'NEGATIVE', 'NEUTRAL'];

const stripHtml = (html) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 200 ? text.slice(0, 200) + '...' : text;
};

function NewsPage() {
    const [news, setNews] = useState([]);
    const [filter, setFilter] = useState('전체');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, [filter]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = filter !== '전체' ? { sentiment: filter } : {};
            const res = await api.get('/api/news', { params });
            setNews(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="news-page">
            <h2>뉴스 감성 분석</h2>

            <div className="filter-tabs">
                {SENTIMENTS.map((s) => (
                    <button
                        key={s}
                        className={filter === s ? 'active' : ''}
                        onClick={() => setFilter(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="loading">불러오는 중...</p>
            ) : (
                <div className="news-list">
                    {news.map((article, idx) => (
                        <div key={article.newsId ?? idx} className="news-card">
                            <div className="news-header">
                                <span className={`badge ${article.sentiment?.toLowerCase()}`}>
                                    {article.sentiment}
                                </span>
                                <span className="news-source">{article.source}</span>
                            </div>
                            <a href={article.url} target="_blank" rel="noreferrer" className="news-headline">
                                {article.headline}
                            </a>
                            <p className="news-summary">{stripHtml(article.summary)}</p>
                            <p className="news-reason">💬 {article.sentimentReason}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NewsPage;

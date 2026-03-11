import { useState } from 'react';
import api from '../api/axios';
import './SearchPage.css';

const SCORE_COLOR = (score) => {
    if (score >= 0.85) return '#51cf66';
    if (score >= 0.70) return '#ffd43b';
    return '#aaa';
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
        <div className="search-page">
            <h2>뉴스 유사도 검색</h2>
            <p className="search-desc">키워드를 입력하면 의미적으로 유사한 뉴스를 찾아드립니다.</p>

            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="예: bitcoin crash, ethereum regulation..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">검색</button>
            </form>

            {loading && <p className="loading">검색 중...</p>}

            {!loading && searched && results.length === 0 && (
                <p className="no-result">검색 결과가 없습니다.</p>
            )}

            {!loading && results.length > 0 && (
                <div className="search-results">
                    {results.map((item, idx) => (
                        <div key={idx} className="result-card">
                            <div className="result-header">
                                <span className={`badge ${item.sentiment?.toLowerCase()}`}>
                                    {item.sentiment}
                                </span>
                                <span className="result-score" style={{ color: SCORE_COLOR(item.score) }}>
                                    유사도 {(item.score * 100).toFixed(1)}%
                                </span>
                            </div>
                            {item.url ? (
                                <a href={item.url} target="_blank" rel="noreferrer" className="result-headline">
                                    {item.headline}
                                </a>
                            ) : (
                                <p className="result-headline">{item.headline}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchPage;

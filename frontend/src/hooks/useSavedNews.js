import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * 뉴스 스크랩 훅
 * - savedNewsIds: 스크랩된 newsId의 Set
 * - savedNews: 전체 스크랩 목록 (MyPage 표시용)
 */
export function useSavedNews(user) {
    const [savedNews, setSavedNews] = useState([]);
    const [savedNewsIds, setSavedNewsIds] = useState(new Set());

    const fetchSaved = useCallback(async () => {
        if (!user) { setSavedNews([]); setSavedNewsIds(new Set()); return; }
        try {
            const res = await api.get('/api/news-scraps');
            setSavedNews(res.data);
            setSavedNewsIds(new Set(res.data.map(n => n.newsId)));
        } catch {
            setSavedNews([]);
        }
    }, [user]);

    useEffect(() => { fetchSaved(); }, [fetchSaved]);

    const save = async (article) => {
        if (!user) return;
        try {
            await api.post('/api/news-scraps', {
                newsId:    article.newsId,
                headline:  article.headline,
                url:       article.url,
                sentiment: article.sentiment,
                source:    article.source,
                category:  article.category,
            });
            setSavedNewsIds(prev => new Set([...prev, article.newsId]));
            setSavedNews(prev => [{
                newsId: article.newsId, headline: article.headline,
                url: article.url, sentiment: article.sentiment,
                source: article.source, category: article.category,
                isRead: false, savedAt: new Date().toISOString(),
            }, ...prev]);
        } catch (e) { console.error(e); }
    };

    const remove = async (newsId) => {
        if (!user) return;
        try {
            await api.delete(`/api/news-scraps/${newsId}`);
            setSavedNewsIds(prev => { const next = new Set(prev); next.delete(newsId); return next; });
            setSavedNews(prev => prev.filter(n => n.newsId !== newsId));
        } catch (e) { console.error(e); }
    };

    const markRead = async (newsId) => {
        try {
            await api.patch(`/api/news-scraps/${newsId}/read`);
            setSavedNews(prev => prev.map(n => n.newsId === newsId ? { ...n, isRead: true } : n));
        } catch (e) { console.error(e); }
    };

    const toggle = (article) => {
        if (savedNewsIds.has(article.newsId)) {
            remove(article.newsId);
        } else {
            save(article);
        }
    };

    return { savedNews, savedNewsIds, toggle, markRead };
}

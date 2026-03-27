import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * 관심종목 훅
 * - watchlist: 북마크된 symbol의 Set
 * - toggle(symbol, assetType): 북마크 토글
 */
export function useWatchlist(user) {
    const [watchlist, setWatchlist] = useState(new Set());

    const fetchWatchlist = useCallback(async () => {
        if (!user) {
            setWatchlist(new Set());
            return;
        }
        try {
            const res = await api.get('/api/watchlist');
            setWatchlist(new Set(res.data.map(w => w.symbol)));
        } catch {
            setWatchlist(new Set());
        }
    }, [user]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const toggle = async (symbol, assetType) => {
        if (!user) return;
        try {
            if (watchlist.has(symbol)) {
                await api.delete(`/api/watchlist?symbol=${encodeURIComponent(symbol)}`);
                setWatchlist(prev => {
                    const next = new Set(prev);
                    next.delete(symbol);
                    return next;
                });
            } else {
                await api.post('/api/watchlist', { symbol, assetType });
                setWatchlist(prev => new Set([...prev, symbol]));
            }
        } catch (e) {
            console.error('관심종목 토글 실패', e);
        }
    };

    return { watchlist, toggle };
}

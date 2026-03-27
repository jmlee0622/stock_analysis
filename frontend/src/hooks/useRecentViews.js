import { useState } from 'react';

const KEY = 'stock_recent_views';
const MAX = 10;

/**
 * 최근 본 종목 훅 (localStorage 기반, 백엔드 불필요)
 * - recentViews: [{ symbol, assetType, label, icon, color, viewedAt }]
 * - addView(item): 맨 앞에 추가, 중복 제거, 최대 10개 유지
 */
export function useRecentViews() {
    const [recentViews, setRecentViews] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(KEY) ?? '[]');
        } catch {
            return [];
        }
    });

    const addView = (item) => {
        setRecentViews(prev => {
            const filtered = prev.filter(v => v.symbol !== item.symbol);
            const next = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX);
            localStorage.setItem(KEY, JSON.stringify(next));
            return next;
        });
    };

    return { recentViews, addView };
}

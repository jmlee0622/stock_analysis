import { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import NewsPage from './pages/NewsPage';
import PricePage from './pages/PricePage';
import SearchPage from './pages/SearchPage';
import StockPage from './pages/StockPage';
import MyPage from './pages/MyPage';
import PortfolioPage from './pages/PortfolioPage';
import { useWatchlist } from './hooks/useWatchlist';
import { useSavedNews } from './hooks/useSavedNews';
import { useRecentViews } from './hooks/useRecentViews';

const COIN_INFO = {
    'BINANCE:BTCUSDT': { label: 'Bitcoin',  color: '#f7931a', icon: '₿' },
    'BINANCE:ETHUSDT': { label: 'Ethereum', color: '#627eea', icon: 'Ξ' },
    'BINANCE:BNBUSDT': { label: 'BNB',      color: '#f3ba2f', icon: '◈' },
    'BINANCE:SOLUSDT': { label: 'Solana',   color: '#9945ff', icon: '◎' },
    'BINANCE:XRPUSDT': { label: 'XRP',      color: '#00aae4', icon: '✕' },
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

function App() {
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [currentTab, setCurrentTab] = useState('price');

    const { watchlist, toggle: toggleWatchlist }    = useWatchlist(user);
    const { savedNews, savedNewsIds, toggle: toggleSaveNews, markRead } = useSavedNews(user);
    const { recentViews, addView }                  = useRecentViews();

    // 소셜 로그인 완료 후 token 처리
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const username = params.get('username');
        if (token && username) {
            localStorage.setItem('token', token);
            setUser(username);
            window.history.replaceState({}, document.title, '/');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setCurrentTab('price');
    };

    // 차트 클릭 시 최근 본 종목 기록
    const handleViewSymbol = (symbol, assetType) => {
        const info = assetType === 'COIN'
            ? (COIN_INFO[symbol] ?? { label: symbol, color: '#888', icon: '?' })
            : (STOCK_INFO[symbol] ?? { label: symbol, color: '#888', icon: '📈' });
        addView({ symbol, assetType, label: info.label, color: info.color, icon: info.icon });
    };

    const handleRemoveWatchlist = (symbol) => {
        toggleWatchlist(symbol, symbol.startsWith('BINANCE:') ? 'COIN' : 'STOCK');
    };

    const renderPage = () => {
        switch (currentTab) {
            case 'price':
                return <PricePage watchlist={watchlist} onToggleWatchlist={toggleWatchlist} onViewSymbol={handleViewSymbol} />;
            case 'stock':
                return <StockPage watchlist={watchlist} onToggleWatchlist={toggleWatchlist} onViewSymbol={handleViewSymbol} />;
            case 'news':
                return <NewsPage savedNewsIds={savedNewsIds} onToggleSave={toggleSaveNews} />;
            case 'search':
                return <SearchPage />;
            case 'portfolio':
                return <PortfolioPage />;
            case 'mypage':
                return (
                    <MyPage
                        watchlist={watchlist}
                        onRemove={handleRemoveWatchlist}
                        savedNews={savedNews}
                        onMarkRead={markRead}
                        onRemoveNews={(newsId) => toggleSaveNews({ newsId })}
                        recentViews={recentViews}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header
                user={user}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                onLoginClick={() => setShowModal(true)}
                onLogout={handleLogout}
            />
            <main className="max-w-6xl mx-auto px-4 py-8">
                {user ? renderPage() : (
                    <LandingPage onLoginClick={() => setShowModal(true)} />
                )}
            </main>
            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onLoginSuccess={(username) => setUser(username)}
                />
            )}
        </div>
    );
}

export default App;

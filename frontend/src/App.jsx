import { useState } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import NewsPage from './pages/NewsPage';
import PricePage from './pages/PricePage';
import SearchPage from './pages/SearchPage';
import './App.css';

function App() {
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [currentTab, setCurrentTab] = useState('news');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setCurrentTab('news');
    };

    const renderPage = () => {
        switch (currentTab) {
            case 'news': return <NewsPage />;
            case 'price': return <PricePage />;
            case 'search': return <SearchPage />;
            default: return null;
        }
    };

    return (
        <div className="app">
            <Header
                user={user}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                onLoginClick={() => setShowModal(true)}
                onLogout={handleLogout}
            />
            <main className="main">
                {user ? renderPage() : (
                    <p className="guide">우측 상단 로그인 버튼을 눌러주세요.</p>
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

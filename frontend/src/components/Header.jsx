import './Header.css';

const TABS = [
    { key: 'price', label: '📊 시세' },
    { key: 'news', label: '📰 뉴스' },
    { key: 'search', label: '🔍 뉴스검색' },
];

function Header({ user, currentTab, onTabChange, onLoginClick, onLogout }) {
    return (
        <header className="header">
            <div className="header-logo">📈 Stock Analysis</div>

            {user && (
                <nav className="header-nav">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`nav-btn ${currentTab === tab.key ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            )}

            <div className="header-right">
                {user ? (
                    <>
                        <span className="header-user">👤 {user}</span>
                        <button className="header-btn" onClick={onLogout}>로그아웃</button>
                    </>
                ) : (
                    <button className="header-btn" onClick={onLoginClick}>🔑 로그인</button>
                )}
            </div>
        </header>
    );
}

export default Header;

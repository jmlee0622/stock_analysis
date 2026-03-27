import { Button } from '@/components/ui/button';

const TABS = [
    { key: 'price',     label: '코인' },
    { key: 'stock',     label: '주식' },
    { key: 'news',      label: '뉴스' },
    { key: 'search',    label: '뉴스 검색' },
    { key: 'portfolio', label: '포트폴리오' },
    { key: 'mypage',    label: '마이페이지' },
];

function Header({ user, currentTab, onTabChange, onLoginClick, onLogout }) {
    return (
        <header style={{
            borderBottom: '1px solid oklch(0.24 0.012 255 / 60%)',
            background: 'oklch(0.07 0.010 255 / 85%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            {/* amber top accent line */}
            <div style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, oklch(0.76 0.155 55) 30%, oklch(0.76 0.155 55 / 40%) 70%, transparent 100%)',
            }} />

            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => onTabChange('price')}
                        className="flex items-center gap-2 group"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: 'oklch(0.76 0.155 55)',
                            color: 'oklch(0.08 0.010 255)',
                            fontSize: 14,
                            fontWeight: 700,
                            fontFamily: 'JetBrains Mono, monospace',
                            flexShrink: 0,
                        }}>
                            ▲
                        </span>
                        <span style={{
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: 700,
                            fontSize: '1rem',
                            letterSpacing: '-0.02em',
                            color: 'oklch(0.94 0.004 255)',
                        }}>
                            StockPulse
                        </span>
                    </button>

                    {user && (
                        <nav className="flex items-center gap-0.5">
                            {TABS.map((tab) => {
                                const isActive = currentTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => onTabChange(tab.key)}
                                        style={{
                                            position: 'relative',
                                            padding: '6px 14px',
                                            borderRadius: 6,
                                            fontSize: '0.8125rem',
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive
                                                ? 'oklch(0.76 0.155 55)'
                                                : 'oklch(0.52 0.012 255)',
                                            background: isActive
                                                ? 'oklch(0.76 0.155 55 / 10%)'
                                                : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            letterSpacing: '0.01em',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.color = 'oklch(0.85 0.008 255)';
                                                e.currentTarget.style.background = 'oklch(0.17 0.010 255)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.color = 'oklch(0.52 0.012 255)';
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        {tab.key === 'mypage' ? '★ ' : ''}{tab.label.replace('관심종목', '관심종목')}
                                        {isActive && (
                                            <span style={{
                                                position: 'absolute',
                                                bottom: 2,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 16,
                                                height: 2,
                                                borderRadius: 1,
                                                background: 'oklch(0.76 0.155 55)',
                                            }} />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="live-dot" />
                                <span style={{
                                    fontSize: '0.8125rem',
                                    color: 'oklch(0.52 0.012 255)',
                                    fontFamily: 'JetBrains Mono, monospace',
                                }}>
                                    {user}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                style={{
                                    padding: '5px 14px',
                                    borderRadius: 6,
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    color: 'oklch(0.52 0.012 255)',
                                    background: 'transparent',
                                    border: '1px solid oklch(0.24 0.012 255 / 70%)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'oklch(0.76 0.155 55 / 50%)';
                                    e.currentTarget.style.color = 'oklch(0.76 0.155 55)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'oklch(0.24 0.012 255 / 70%)';
                                    e.currentTarget.style.color = 'oklch(0.52 0.012 255)';
                                }}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            style={{
                                padding: '6px 18px',
                                borderRadius: 6,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'oklch(0.10 0.010 255)',
                                background: 'oklch(0.76 0.155 55)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: '0 0 16px oklch(0.76 0.155 55 / 30%)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'oklch(0.82 0.15 55)';
                                e.currentTarget.style.boxShadow = '0 0 24px oklch(0.76 0.155 55 / 50%)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'oklch(0.76 0.155 55)';
                                e.currentTarget.style.boxShadow = '0 0 16px oklch(0.76 0.155 55 / 30%)';
                            }}
                        >
                            로그인
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;

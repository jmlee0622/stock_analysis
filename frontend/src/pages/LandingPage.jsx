import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const FEATURES = [
    {
        icon: '₿',
        label: 'CRYPTO',
        title: '실시간 코인 시세',
        desc: 'BTC, ETH 등 8개 암호화폐 실시간 가격과 공포·탐욕 지수를 한눈에 확인',
        color: 'oklch(0.76 0.155 55)',
    },
    {
        icon: '◈',
        label: 'STOCKS',
        title: '미국 주식 분석',
        desc: 'NVDA, TSLA, AAPL 등 주요 종목의 실시간 시세와 섹터 히트맵 제공',
        color: 'oklch(0.65 0.18 260)',
    },
    {
        icon: '◎',
        label: 'AI',
        title: 'AI 뉴스 감성분석',
        desc: 'FinBERT AI가 실시간 뉴스를 POSITIVE / NEGATIVE / NEUTRAL로 자동 분류',
        color: 'oklch(0.62 0.20 160)',
    },
];

const TICKERS = [
    { symbol: 'BTC/USDT', value: '97,234.50', change: '+2.41%', up: true },
    { symbol: 'ETH/USDT', value: '3,421.80',  change: '+1.87%', up: true },
    { symbol: 'NVDA',     value: '138.92',     change: '-0.63%', up: false },
    { symbol: 'AAPL',     value: '211.45',     change: '+0.34%', up: true },
    { symbol: 'TSLA',     value: '248.17',     change: '+3.22%', up: true },
    { symbol: 'MSFT',     value: '420.30',     change: '-0.18%', up: false },
];

function TickerBar() {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setOffset(prev => (prev - 1) % (TICKERS.length * 160));
        }, 30);
        return () => clearInterval(id);
    }, []);

    const doubled = [...TICKERS, ...TICKERS];

    return (
        <div style={{
            overflow: 'hidden',
            borderTop: '1px solid oklch(0.24 0.012 255 / 50%)',
            borderBottom: '1px solid oklch(0.24 0.012 255 / 50%)',
            background: 'oklch(0.10 0.010 255 / 80%)',
            padding: '10px 0',
            marginBottom: 64,
        }}>
            <div style={{
                display: 'flex',
                gap: 48,
                transform: `translateX(${offset}px)`,
                whiteSpace: 'nowrap',
                willChange: 'transform',
            }}>
                {doubled.map((t, i) => (
                    <span key={i} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.8125rem',
                    }}>
                        <span style={{ color: 'oklch(0.60 0.012 255)' }}>{t.symbol}</span>
                        <span style={{ color: 'oklch(0.94 0.004 255)', fontWeight: 600 }}>{t.value}</span>
                        <span style={{ color: t.up ? 'oklch(0.70 0.20 25)' : 'oklch(0.60 0.16 255)' }}>
                            {t.change}
                        </span>
                        <span style={{ color: 'oklch(0.28 0.012 255)', marginLeft: 12 }}>·</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

function LandingPage({ onLoginClick }) {
    return (
        <div>
            <TickerBar />

            {/* Hero */}
            <div className="text-center animate-fade-up" style={{ paddingBottom: 80 }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 14px',
                    borderRadius: 100,
                    border: '1px solid oklch(0.76 0.155 55 / 30%)',
                    background: 'oklch(0.76 0.155 55 / 8%)',
                    marginBottom: 28,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'oklch(0.76 0.155 55)',
                    letterSpacing: '0.08em',
                    fontFamily: 'JetBrains Mono, monospace',
                }}>
                    <span className="live-dot" />
                    LIVE · REAL-TIME DATA
                </div>

                <h1 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    marginBottom: 24,
                    color: 'oklch(0.96 0.004 255)',
                }}>
                    주식 · 코인을<br />
                    <span style={{
                        color: 'oklch(0.76 0.155 55)',
                        textShadow: '0 0 40px oklch(0.76 0.155 55 / 40%)',
                    }}>
                        한눈에
                    </span>
                </h1>

                <p className="animate-fade-up-delay-1" style={{
                    fontSize: '1.0625rem',
                    color: 'oklch(0.52 0.012 255)',
                    maxWidth: 440,
                    margin: '0 auto 36px',
                    lineHeight: 1.7,
                }}>
                    실시간 시세, AI 뉴스 감성분석,<br />
                    섹터 히트맵까지 투자에 필요한 정보를 한 곳에서
                </p>

                <div className="animate-fade-up-delay-2" style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button
                        onClick={onLoginClick}
                        style={{
                            padding: '12px 32px',
                            borderRadius: 8,
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: 'oklch(0.08 0.010 255)',
                            background: 'oklch(0.76 0.155 55)',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 0 32px oklch(0.76 0.155 55 / 40%)',
                            transition: 'all 0.2s',
                            letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 0 48px oklch(0.76 0.155 55 / 60%)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = '0 0 32px oklch(0.76 0.155 55 / 40%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        무료로 시작하기 →
                    </button>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="animate-fade-up-delay-2" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 80,
            }}>
                {FEATURES.map((f, i) => (
                    <div key={f.title} style={{
                        padding: '28px 28px',
                        borderRadius: 10,
                        border: `1px solid oklch(0.24 0.012 255 / 60%)`,
                        background: 'oklch(0.115 0.010 255)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        animationDelay: `${i * 0.08 + 0.2}s`,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${f.color.replace(')', ' / 25%)')}, 0 16px 40px oklch(0 0 0 / 40%)`;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                        {/* top accent */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            height: 2,
                            background: `linear-gradient(90deg, ${f.color} 0%, transparent 100%)`,
                        }} />

                        <div style={{
                            fontSize: '1.75rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: f.color,
                            marginBottom: 16,
                            lineHeight: 1,
                        }}>
                            {f.icon}
                        </div>

                        <div style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            color: f.color,
                            fontFamily: 'JetBrains Mono, monospace',
                            marginBottom: 8,
                        }}>
                            {f.label}
                        </div>

                        <p style={{
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: 'oklch(0.94 0.004 255)',
                            marginBottom: 8,
                            letterSpacing: '-0.01em',
                        }}>
                            {f.title}
                        </p>

                        <p style={{
                            fontSize: '0.875rem',
                            color: 'oklch(0.52 0.012 255)',
                            lineHeight: 1.6,
                        }}>
                            {f.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Preview blur CTA */}
            <div style={{
                borderRadius: 12,
                border: '1px solid oklch(0.24 0.012 255 / 60%)',
                overflow: 'hidden',
                position: 'relative',
                background: 'oklch(0.115 0.010 255)',
            }}>
                {/* fake chart preview */}
                <div style={{
                    height: 220,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 3,
                    padding: '24px 24px 0',
                    filter: 'blur(3px)',
                    opacity: 0.4,
                }}>
                    {[60,75,55,80,70,90,65,85,72,95,80,100,88,92,85,97,90,88,95,100].map((h, i) => (
                        <div key={i} style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: '3px 3px 0 0',
                            background: i > 14
                                ? `linear-gradient(180deg, oklch(0.76 0.155 55) 0%, oklch(0.76 0.155 55 / 20%) 100%)`
                                : `oklch(0.22 0.010 255)`,
                        }} />
                    ))}
                </div>

                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'oklch(0.08 0.010 255 / 60%)',
                    backdropFilter: 'blur(2px)',
                    gap: 16,
                }}>
                    <p style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        color: 'oklch(0.94 0.004 255)',
                        letterSpacing: '-0.02em',
                    }}>
                        로그인하면 실시간 데이터를 볼 수 있어요
                    </p>
                    <button
                        onClick={onLoginClick}
                        style={{
                            padding: '10px 28px',
                            borderRadius: 7,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'oklch(0.08 0.010 255)',
                            background: 'oklch(0.76 0.155 55)',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 0 24px oklch(0.76 0.155 55 / 40%)',
                        }}
                    >
                        로그인 / 회원가입
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;

import { useState } from 'react';
import api from '../api/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// 백엔드 주소 (소셜 로그인은 API 호출이 아닌 브라우저 이동이라 직접 사용)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function AuthModal({ onClose, onLoginSuccess }) {
    const [tab, setTab] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            onLoginSuccess(username);
            onClose();
        } catch {
            setError('아이디 또는 비밀번호가 틀렸습니다.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/register', { username, password });
            setMessage('회원가입 완료! 로그인해주세요.');
            setTab('login');
            setUsername('');
            setPassword('');
        } catch {
            setError('이미 존재하는 아이디입니다.');
        }
    };

    // 소셜 로그인: 브라우저를 백엔드 OAuth2 시작 URL로 이동
    // Spring Security가 자동으로 구글/네이버 로그인 페이지로 리다이렉트해줌
    const handleSocialLogin = (provider) => {
        window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {tab === 'login' ? '로그인' : '회원가입'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-1 bg-muted rounded-lg p-1 mb-2">
                    {['login', 'register'].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); setMessage(''); }}
                            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors
                                ${tab === t
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t === 'login' ? '로그인' : '회원가입'}
                        </button>
                    ))}
                </div>

                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">아이디</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="아이디 입력"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호 입력"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {message && <p className="text-sm text-green-400">{message}</p>}
                    <Button type="submit" className="w-full">
                        {tab === 'login' ? '로그인' : '회원가입'}
                    </Button>
                </form>

                {/* 소셜 로그인 구분선 */}
                <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">또는</span>
                    </div>
                </div>

                {/* 구글 로그인 버튼 */}
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                    {/* 구글 로고 SVG */}
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.87v2.07A8 8 0 0 0 8.98 17z"/>
                        <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.52.09-1.02.25-1.52V5.41H1.87A8 8 0 0 0 .98 9c0 1.29.31 2.51.89 3.59l2.64-2.07z"/>
                        <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.11 4.41l2.64 2.07c.63-1.89 2.39-3.3 4.47-3.3z"/>
                    </svg>
                    Google로 계속하기
                </button>

                {/* 네이버 로그인 버튼 */}
                <button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: '#03C75A' }}
                >
                    {/* 네이버 N 로고 */}
                    <span className="font-bold text-white text-base leading-none">N</span>
                    네이버로 계속하기
                </button>
            </DialogContent>
        </Dialog>
    );
}

export default AuthModal;

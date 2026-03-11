import { useState } from 'react';
import api from '../api/axios';
import './AuthModal.css';

function AuthModal({ onClose, onLoginSuccess }) {
    const [tab, setTab] = useState('login');       // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            const res = await api.post('/auth/login', params);
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
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            await api.post('/auth/register', params);
            setMessage('회원가입 완료! 로그인해주세요.');
            setTab('login');
            setUsername('');
            setPassword('');
        } catch {
            setError('이미 존재하는 아이디입니다.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-tabs">
                    <button
                        className={tab === 'login' ? 'active' : ''}
                        onClick={() => { setTab('login'); setError(''); setMessage(''); }}
                    >
                        로그인
                    </button>
                    <button
                        className={tab === 'register' ? 'active' : ''}
                        onClick={() => { setTab('register'); setError(''); setMessage(''); }}
                    >
                        회원가입
                    </button>
                </div>

                <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    {message && <p className="success">{message}</p>}
                    <button type="submit">
                        {tab === 'login' ? '로그인' : '회원가입'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;

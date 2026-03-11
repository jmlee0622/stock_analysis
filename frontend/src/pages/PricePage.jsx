import { useEffect, useState } from 'react';
import api from '../api/axios';
import './PricePage.css';

const SYMBOLS = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'];

const LABEL = {
    'BINANCE:BTCUSDT': 'Bitcoin (BTC)',
    'BINANCE:ETHUSDT': 'Ethereum (ETH)',
};

function PricePage() {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 5000); // 5초마다 갱신
        return () => clearInterval(interval);
    }, []);

    const fetchPrices = async () => {
        try {
            const res = await api.get('/api/trades/latest');
            setPrices(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="price-page">
            <h2>실시간 시세</h2>
            <p className="refresh-info">5초마다 자동 갱신</p>

            {loading ? (
                <p className="loading">불러오는 중...</p>
            ) : (
                <div className="price-list">
                    {prices.map((item) => (
                        <div key={item.symbol} className="price-card">
                            <div className="price-symbol">{LABEL[item.symbol] ?? item.symbol}</div>
                            <div className="price-value">${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="price-meta">
                                <span>거래량: {item.volume}</span>
                                <span>{new Date(item.tradeTime).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PricePage;

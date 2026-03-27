package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.CryptoQuoteResponse;
import com.example.stock_analysis.domain.dto.TradeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Binance REST API에서 실시간 현재가 및 과거 캔들(kline) 데이터를 가져오는 서비스
 */
@Service
@Slf4j
public class BinanceKlineService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BINANCE_URL        = "https://api.binance.com/api/v3/klines";
    private static final String BINANCE_TICKER_24H = "https://api.binance.com/api/v3/ticker/24hr";

    private static final List<String> SYMBOLS = List.of(
            "BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:BNBUSDT",
            "BINANCE:SOLUSDT", "BINANCE:XRPUSDT", "BINANCE:DOGEUSDT",
            "BINANCE:ADAUSDT", "BINANCE:AVAXUSDT"
    );

    // 현재 실시간 가격 조회 - 24hr 티커 (변동률 포함)
    @SuppressWarnings("unchecked")
    public List<CryptoQuoteResponse> getCurrentPrices() {
        return SYMBOLS.stream()
                .map(symbol -> {
                    String binanceSymbol = symbol.replace("BINANCE:", "");
                    String url = BINANCE_TICKER_24H + "?symbol=" + binanceSymbol;
                    try {
                        Map<String, Object> res = restTemplate.getForObject(url, Map.class);
                        double price     = Double.parseDouble(res.get("lastPrice").toString());
                        double change    = Double.parseDouble(res.get("priceChange").toString());
                        double changePct = Double.parseDouble(res.get("priceChangePercent").toString());
                        double high      = Double.parseDouble(res.get("highPrice").toString());
                        double low       = Double.parseDouble(res.get("lowPrice").toString());
                        return new CryptoQuoteResponse(symbol, price, change, changePct, high, low);
                    } catch (Exception e) {
                        log.error("Binance 현재가 조회 실패 - symbol: {}, error: {}", symbol, e.getMessage());
                        return null;
                    }
                })
                .filter(r -> r != null)
                .toList();
    }

    // range → (interval, limit)
    // 1w: 1시간봉 168개 (7일 * 24시간)
    // 1m: 4시간봉 180개 (30일 * 6)
    // 1y: 1일봉 365개
    public List<TradeResponse> getKlines(String symbol, String range) {
        String binanceSymbol = symbol.replace("BINANCE:", "");
        String interval;
        int limit;

        switch (range) {
            case "1h" -> { interval = "1m";  limit = 60;  }
            case "1d" -> { interval = "1h";  limit = 24;  }
            case "1w" -> { interval = "1h";  limit = 168; }
            case "1m" -> { interval = "4h";  limit = 180; }
            case "1y" -> { interval = "1d";  limit = 365; }
            default   -> { interval = "1m";  limit = 60;  }
        }

        String url = BINANCE_URL + "?symbol=" + binanceSymbol
                + "&interval=" + interval + "&limit=" + limit;

        try {
            // Binance 응답: [[openTime, open, high, low, close, volume, closeTime, ...], ...]
            Object[][] raw = restTemplate.getForObject(url, Object[][].class);
            if (raw == null) return List.of();

            return Arrays.stream(raw)
                    .map(candle -> {
                        long closeTimeMs = ((Number) candle[6]).longValue();
                        double closePrice = Double.parseDouble(candle[4].toString());
                        double volume = Double.parseDouble(candle[5].toString());
                        return new TradeResponse(
                                symbol,
                                closePrice,
                                volume,
                                Instant.ofEpochMilli(closeTimeMs)
                        );
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Binance kline 조회 실패 - symbol: {}, range: {}, error: {}", symbol, range, e.getMessage());
            return List.of();
        }
    }
}

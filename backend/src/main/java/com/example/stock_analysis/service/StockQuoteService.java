package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.StockQuoteResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Finnhub REST API로 미국 주식 현재가 및 캔들 데이터를 조회하는 서비스
 */
@Service
@Slf4j
public class StockQuoteService {

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpEntity<Void> yahooHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        headers.set("Accept", "application/json");
        return new HttpEntity<>(headers);
    }

    @Value("${finnhub.api-key}")
    private String apiKey;

    private static final String BASE_URL   = "https://finnhub.io/api/v1";
    private static final List<String> SYMBOLS  = List.of("NVDA", "TSLA", "AAPL", "MSFT", "GOOGL", "NFLX", "AMZN", "AMD");
    private static final List<String> INDICES  = List.of("^GSPC", "^IXIC", "^DJI");
    private static final Map<String, String> INDEX_LABELS = Map.of(
            "^GSPC", "S&P 500",
            "^IXIC", "NASDAQ",
            "^DJI",  "DOW"
    );

    // 주요 지수 조회 (S&P500, NASDAQ, DOW) - Yahoo Finance
    @SuppressWarnings("unchecked")
    public List<StockQuoteResponse> getIndices() {
        return INDICES.stream()
                .map(symbol -> {
                    String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1d&range=2d";
                    try {
                        var response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, yahooHeaders(), Map.class);
                        Map<String, Object> res = response.getBody();
                        Map<String, Object> chart = (Map<String, Object>) res.get("chart");
                        List<Map<String, Object>> results = (List<Map<String, Object>>) chart.get("result");
                        Map<String, Object> meta = (Map<String, Object>) results.get(0).get("meta");
                        double price     = ((Number) meta.get("regularMarketPrice")).doubleValue();
                        double prevClose = ((Number) meta.get("chartPreviousClose")).doubleValue();
                        double change    = price - prevClose;
                        double changePct = (change / prevClose) * 100;
                        String label     = INDEX_LABELS.getOrDefault(symbol, symbol);
                        return new StockQuoteResponse(label, price, change, changePct, price, price);
                    } catch (Exception e) {
                        log.error("지수 조회 실패 - symbol: {}, error: {}", symbol, e.getMessage());
                        return null;
                    }
                })
                .filter(r -> r != null)
                .toList();
    }

    // 현재가 전체 조회
    @SuppressWarnings("unchecked")
    public List<StockQuoteResponse> getCurrentPrices() {
        return SYMBOLS.stream()
                .map(symbol -> {
                    String url = BASE_URL + "/quote?symbol=" + symbol + "&token=" + apiKey;
                    try {
                        Map<String, Object> res = restTemplate.getForObject(url, Map.class);
                        double price  = ((Number) res.get("c")).doubleValue();  // current price
                        double change = ((Number) res.get("d")).doubleValue();  // change
                        double changePct = ((Number) res.get("dp")).doubleValue(); // % change
                        double high   = ((Number) res.get("h")).doubleValue();
                        double low    = ((Number) res.get("l")).doubleValue();
                        return new StockQuoteResponse(symbol, price, change, changePct, high, low);
                    } catch (Exception e) {
                        log.error("주식 현재가 조회 실패 - symbol: {}, error: {}", symbol, e.getMessage());
                        return null;
                    }
                })
                .filter(r -> r != null)
                .toList();
    }

    // 차트용 캔들 데이터 조회 (Yahoo Finance - 무료, 인증 불필요)
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCandles(String symbol, String range) {
        String interval;
        String yahooRange;

        switch (range) {
            case "1h" -> { interval = "5m";  yahooRange = "1d";  }
            case "1d" -> { interval = "30m"; yahooRange = "5d";  }
            case "1w" -> { interval = "1h";  yahooRange = "1mo"; }
            case "1m" -> { interval = "1d";  yahooRange = "3mo"; }
            case "1y" -> { interval = "1wk"; yahooRange = "1y";  }
            default   -> { interval = "5m";  yahooRange = "1d";  }
        }

        String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol
                + "?interval=" + interval + "&range=" + yahooRange;

        try {
            var response = restTemplate.exchange(url, HttpMethod.GET, yahooHeaders(), Map.class);
            Map<String, Object> res = response.getBody();
            if (res == null) { log.warn("Yahoo 응답 null - symbol: {}", symbol); return List.of(); }

            Map<String, Object> chart = (Map<String, Object>) res.get("chart");
            List<Map<String, Object>> results = (List<Map<String, Object>>) chart.get("result");
            if (results == null || results.isEmpty()) {
                log.warn("Yahoo 결과 없음 - symbol: {}, error: {}", symbol, chart.get("error"));
                return List.of();
            }

            Map<String, Object> result       = results.get(0);
            List<Number> timestamps          = (List<Number>) result.get("timestamp");
            Map<String, Object> indicators   = (Map<String, Object>) result.get("indicators");
            List<Map<String, Object>> quotes = (List<Map<String, Object>>) indicators.get("quote");
            List<Number> closes              = (List<Number>) quotes.get(0).get("close");

            List<Map<String, Object>> data = new java.util.ArrayList<>();
            for (int i = 0; i < timestamps.size(); i++) {
                if (closes.get(i) == null) continue;
                data.add(Map.of(
                        "symbol",    symbol,
                        "price",     closes.get(i).doubleValue(),
                        "tradeTime", Instant.ofEpochSecond(timestamps.get(i).longValue()).toString()
                ));
            }
            log.info("Yahoo 캔들 조회 성공 - symbol: {}, range: {}, 데이터: {}건", symbol, range, data.size());
            return data;
        } catch (Exception e) {
            log.error("주식 캔들 조회 실패 - symbol: {}, range: {}, error: {}", symbol, range, e.getMessage(), e);
            return List.of();
        }
    }
}

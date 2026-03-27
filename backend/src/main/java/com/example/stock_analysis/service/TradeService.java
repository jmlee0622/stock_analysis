package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.TradeResponse;
import com.example.stock_analysis.domain.repository.StockTradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

/** DB에서 최신 시세를 조회하고 Redis 캐시를 적용하는 서비스 */
@Service
@RequiredArgsConstructor
public class TradeService {

    private final StockTradeRepository stockTradeRepository;

    private static final List<String> SYMBOLS = List.of("BINANCE:BTCUSDT", "BINANCE:ETHUSDT");

    // 특정 symbol의 최신 시세 (캐시 키: symbol값)
    @Cacheable(value = "latestTrade", key = "#symbol")
    public TradeResponse getLatestBySymbol(String symbol) {
        return stockTradeRepository.findTopBySymbolOrderByTradeTimeDesc(symbol)
                .map(TradeResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("데이터 없음: " + symbol));
    }

    // BTC + ETH 최신 시세 전체
    @Cacheable(value = "latestTrades")
    public List<TradeResponse> getLatestAll() {
        return SYMBOLS.stream()
                .flatMap(symbol -> stockTradeRepository.findTopBySymbolOrderByTradeTimeDesc(symbol).stream())
                .map(TradeResponse::from)
                .toList();
    }

    // 차트용: symbol별 최근 N건 (오래된 순으로 정렬)
    public List<TradeResponse> getHistoryBySymbol(String symbol, int limit) {
        List<TradeResponse> list = stockTradeRepository
                .findBySymbolOrderByTradeTimeDesc(symbol, PageRequest.of(0, limit))
                .stream()
                .map(TradeResponse::from)
                .toList();
        List<TradeResponse> result = new java.util.ArrayList<>(list);
        Collections.reverse(result);
        return result;
    }

    // 차트용: symbol + 시간 범위 기반 조회
    public List<TradeResponse> getHistoryByRange(String symbol, String range) {
        Instant from = switch (range) {
            case "1h"  -> Instant.now().minus(1,   ChronoUnit.HOURS);
            case "1d"  -> Instant.now().minus(1,   ChronoUnit.DAYS);
            case "1w"  -> Instant.now().minus(7,   ChronoUnit.DAYS);
            case "1m"  -> Instant.now().minus(30,  ChronoUnit.DAYS);
            case "1y"  -> Instant.now().minus(365, ChronoUnit.DAYS);
            default    -> Instant.now().minus(1,   ChronoUnit.HOURS);
        };
        return stockTradeRepository
                .findBySymbolAndTradeTimeAfterOrderByTradeTimeAsc(symbol, from)
                .stream()
                .map(TradeResponse::from)
                .toList();
    }
}

package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.TradeResponse;
import com.example.stock_analysis.domain.repository.StockTradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

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
}

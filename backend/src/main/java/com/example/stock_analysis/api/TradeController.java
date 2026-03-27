package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.CryptoQuoteResponse;
import com.example.stock_analysis.domain.dto.TradeResponse;
import com.example.stock_analysis.service.BinanceKlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 실시간 시세 조회 REST API 엔드포인트 - GET /api/trades/latest */
@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final BinanceKlineService binanceKlineService;

    // GET /api/trades/latest → BTC + ETH 실시간 현재가 (Binance 24hr 티커)
    @GetMapping("/latest")
    public ResponseEntity<List<CryptoQuoteResponse>> getLatest() {
        return ResponseEntity.ok(binanceKlineService.getCurrentPrices());
    }

    // GET /api/trades/history?symbol=BINANCE:BTCUSDT&range=1h  → 차트 히스토리 (전 범위 Binance API)
    // range: 1h, 1d, 1w, 1m, 1y
    @GetMapping("/history")
    public ResponseEntity<List<TradeResponse>> getHistory(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "1h") String range) {
        return ResponseEntity.ok(binanceKlineService.getKlines(symbol, range));
    }
}

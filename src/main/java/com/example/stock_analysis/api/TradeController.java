package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.TradeResponse;
import com.example.stock_analysis.service.TradeService;
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

    private final TradeService tradeService;

    // GET /api/trades/latest?symbol=BINANCE:BTCUSDT  → 특정 심볼
    // GET /api/trades/latest                          → BTC + ETH 전체
    @GetMapping("/latest")
    public ResponseEntity<?> getLatest(@RequestParam(required = false) String symbol) {
        if (symbol != null) {
            TradeResponse response = tradeService.getLatestBySymbol(symbol);
            return ResponseEntity.ok(response);
        }
        List<TradeResponse> responses = tradeService.getLatestAll();
        return ResponseEntity.ok(responses);
    }
}

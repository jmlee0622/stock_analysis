package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.StockQuoteResponse;
import com.example.stock_analysis.service.StockQuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** 미국 주식 시세 REST API */
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockQuoteService stockQuoteService;

    // GET /api/stocks/latest → 전체 주식 현재가
    @GetMapping("/latest")
    public ResponseEntity<List<StockQuoteResponse>> getLatest() {
        return ResponseEntity.ok(stockQuoteService.getCurrentPrices());
    }

    // GET /api/stocks/indices → S&P500, NASDAQ, DOW 지수
    @GetMapping("/indices")
    public ResponseEntity<List<StockQuoteResponse>> getIndices() {
        return ResponseEntity.ok(stockQuoteService.getIndices());
    }

    // GET /api/stocks/history?symbol=NVDA&range=1d → 차트용 캔들
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "1d") String range) {
        return ResponseEntity.ok(stockQuoteService.getCandles(symbol, range));
    }
}

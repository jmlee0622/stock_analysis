package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.WatchlistResponse;
import com.example.stock_analysis.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 관심종목 REST API */
@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    public record WatchlistRequest(String symbol, String assetType) {}

    // GET /api/watchlist → 내 관심종목 목록
    @GetMapping
    public ResponseEntity<List<WatchlistResponse>> getWatchlist(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok(watchlistService.getWatchlist(username));
    }

    // POST /api/watchlist → 관심종목 추가
    @PostMapping
    public ResponseEntity<Void> add(@AuthenticationPrincipal String username,
                                    @RequestBody WatchlistRequest req) {
        watchlistService.add(username, req.symbol(), req.assetType());
        return ResponseEntity.ok().build();
    }

    // DELETE /api/watchlist?symbol=XXX → 관심종목 삭제
    @DeleteMapping
    public ResponseEntity<Void> remove(@AuthenticationPrincipal String username,
                                       @RequestParam String symbol) {
        watchlistService.remove(username, symbol);
        return ResponseEntity.ok().build();
    }
}

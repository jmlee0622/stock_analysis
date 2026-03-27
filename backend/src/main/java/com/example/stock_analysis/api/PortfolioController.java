package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.PortfolioResponse;
import com.example.stock_analysis.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    public record PortfolioRequest(String symbol, String assetType,
                                   BigDecimal quantity, BigDecimal avgPrice) {}

    @GetMapping
    public ResponseEntity<List<PortfolioResponse>> getPortfolio(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok(portfolioService.getPortfolio(username));
    }

    @PostMapping
    public ResponseEntity<PortfolioResponse> add(@AuthenticationPrincipal String username,
                                                  @RequestBody PortfolioRequest req) {
        return ResponseEntity.ok(portfolioService.add(
                username, req.symbol(), req.assetType(), req.quantity(), req.avgPrice()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal String username,
                                       @PathVariable Long id) {
        portfolioService.remove(username, id);
        return ResponseEntity.ok().build();
    }
}

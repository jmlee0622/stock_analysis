package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.SavedNewsResponse;
import com.example.stock_analysis.service.SavedNewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news-scraps")
@RequiredArgsConstructor
public class SavedNewsController {

    private final SavedNewsService savedNewsService;

    public record SaveRequest(Long newsId, String headline, String url,
                              String sentiment, String source, String category) {}

    @GetMapping
    public ResponseEntity<List<SavedNewsResponse>> getSaved(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok(savedNewsService.getSavedNews(username));
    }

    @PostMapping
    public ResponseEntity<Void> save(@AuthenticationPrincipal String username,
                                     @RequestBody SaveRequest req) {
        savedNewsService.save(username, req.newsId(), req.headline(), req.url(),
                req.sentiment(), req.source(), req.category());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{newsId}/read")
    public ResponseEntity<Void> markRead(@AuthenticationPrincipal String username,
                                         @PathVariable Long newsId) {
        savedNewsService.markRead(username, newsId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{newsId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal String username,
                                       @PathVariable Long newsId) {
        savedNewsService.remove(username, newsId);
        return ResponseEntity.ok().build();
    }
}

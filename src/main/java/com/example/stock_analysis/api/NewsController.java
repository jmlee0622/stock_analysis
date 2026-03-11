package com.example.stock_analysis.api;

import com.example.stock_analysis.domain.dto.NewsResponse;
import com.example.stock_analysis.news.NewsVectorService;
import com.example.stock_analysis.service.NewsQueryService;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** 뉴스 및 감성 분석 결과 조회 REST API 엔드포인트 - GET /api/news */
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsQueryService newsQueryService;
    private final NewsVectorService newsVectorService;

    // GET /api/news                        → 전체 최신 뉴스
    // GET /api/news?sentiment=POSITIVE     → 감성 필터링
    @GetMapping
    public ResponseEntity<List<NewsResponse>> getNews(@RequestParam(required = false) String sentiment) {
        if (sentiment != null) {
            return ResponseEntity.ok(newsQueryService.getNewsBySentiment(sentiment));
        }
        return ResponseEntity.ok(newsQueryService.getLatestNews());
    }

    // POST /api/news/migrate  → 기존 뉴스를 ChromaDB로 마이그레이션
    @org.springframework.web.bind.annotation.PostMapping("/migrate")
    public ResponseEntity<String> migrate() {
        int count = newsVectorService.migrateExistingNews();
        return ResponseEntity.ok(count + "건 ChromaDB 저장 완료");
    }

    // GET /api/news/search?q=bitcoin+crash&limit=5  → 유사도 검색
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchNews(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int limit) {

        List<EmbeddingMatch<TextSegment>> matches = newsVectorService.searchSimilarNews(q, limit);

        List<Map<String, Object>> result = matches.stream()
                .map(match -> Map.<String, Object>of(
                        "score", match.score(),
                        "headline", match.embedded().metadata().getString("headline"),
                        "sentiment", match.embedded().metadata().getString("sentiment"),
                        "newsId", match.embedded().metadata().getString("newsId"),
                        "url", match.embedded().metadata().getString("url") != null
                                ? match.embedded().metadata().getString("url") : ""
                ))
                .toList();

        return ResponseEntity.ok(result);
    }
}

package com.example.stock_analysis.service;

import com.example.stock_analysis.domain.dto.NewsResponse;
import com.example.stock_analysis.domain.repository.NewsArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/** DB에서 뉴스를 조회하고 Redis 캐시를 적용하는 서비스 */
@Service
@RequiredArgsConstructor
public class NewsQueryService {

    private final NewsArticleRepository newsArticleRepository;

    // 전체 최신 뉴스 20건 (캐시)
    @Cacheable(value = "newsList")
    public List<NewsResponse> getLatestNews() {
        return newsArticleRepository.findTop20ByOrderByPublishedAtDesc()
                .stream()
                .map(NewsResponse::from)
                .toList();
    }

    // sentiment 필터링 뉴스 (캐시 키: sentiment값)
    @Cacheable(value = "newsBySentiment", key = "#sentiment")
    public List<NewsResponse> getNewsBySentiment(String sentiment) {
        return newsArticleRepository.findTop20BySentimentOrderByPublishedAtDesc(sentiment.toUpperCase())
                .stream()
                .map(NewsResponse::from)
                .toList();
    }
}

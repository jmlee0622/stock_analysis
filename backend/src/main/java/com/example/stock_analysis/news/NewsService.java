package com.example.stock_analysis.news;

import com.example.stock_analysis.domain.dto.FinnhubNewsDto;
import com.example.stock_analysis.domain.entity.NewsArticle;
import com.example.stock_analysis.domain.repository.NewsArticleRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

/** Finnhub REST API에서 뉴스를 수집하고 감성 분석 후 DB에 저장하는 서비스 */
@Service
@Slf4j
public class NewsService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final NewsArticleRepository newsArticleRepository;
    private final SentimentAnalysisService sentimentAnalysisService;
    private final NewsVectorService newsVectorService;
    private final Counter positiveCounter;  // POSITIVE 건수
    private final Counter negativeCounter;  // NEGATIVE 건수
    private final Counter neutralCounter;   // NEUTRAL 건수

    @Value("${finnhub.api-key}")
    private String apiKey;

    @Value("${finnhub.news-url}")
    private String newsUrl;

    public NewsService(NewsArticleRepository newsArticleRepository,
                       SentimentAnalysisService sentimentAnalysisService,
                       NewsVectorService newsVectorService,
                       MeterRegistry meterRegistry) {
        this.newsArticleRepository = newsArticleRepository;
        this.sentimentAnalysisService = sentimentAnalysisService;
        this.newsVectorService = newsVectorService;
        this.positiveCounter = Counter.builder("news.sentiment")
                .tag("result", "POSITIVE").register(meterRegistry);
        this.negativeCounter = Counter.builder("news.sentiment")
                .tag("result", "NEGATIVE").register(meterRegistry);
        this.neutralCounter = Counter.builder("news.sentiment")
                .tag("result", "NEUTRAL").register(meterRegistry);
    }

    public void fetchAndAnalyzeNews() {
        fetchAndAnalyzeNews("crypto", "CRYPTO");
    }

    @CacheEvict(value = {"newsList", "newsByCategory", "newsBySentiment", "newsBySentimentAndCategory"}, allEntries = true)
    public void fetchAndAnalyzeNews(String finnhubCategory, String saveCategory) {
        String url = newsUrl + "?category=" + finnhubCategory + "&token=" + apiKey;

        FinnhubNewsDto[] newsDtos = restTemplate.getForObject(url, FinnhubNewsDto[].class);

        if (newsDtos == null || newsDtos.length == 0) {
            log.info("가져올 뉴스가 없습니다.");
            return;
        }

        log.info("뉴스 {}건 수집됨, 감성 분석 시작...", newsDtos.length);
        int savedCount = 0;

        for (FinnhubNewsDto dto : newsDtos) {
            // 이미 분석한 뉴스는 건너뜀 (중복 방지)
            if (newsArticleRepository.existsByNewsId(dto.getId())) {
                continue;
            }

            // Claude로 감성 분석
            SentimentResult result = sentimentAnalysisService.analyze(dto.getHeadline(), dto.getSummary());

            // DB 저장
            NewsArticle article = NewsArticle.builder()
                    .newsId(dto.getId())
                    .headline(dto.getHeadline())
                    .summary(dto.getSummary())
                    .url(dto.getUrl())
                    .source(dto.getSource())
                    .publishedAt(Instant.ofEpochSecond(dto.getDatetime()))
                    .sentiment(result.getSentiment())
                    .sentimentReason(result.getReason())
                    .analyzedAt(Instant.now())
                    .category(saveCategory)
                    .build();

            NewsArticle saved = newsArticleRepository.save(article);
            log.info("[{}] {}", result.getSentiment(), dto.getHeadline());

            // ChromaDB에 벡터 저장
            newsVectorService.storeNewsEmbedding(
                    saved.getId(), dto.getHeadline(), dto.getSummary(), result.getSentiment(), dto.getUrl()
            );

            // 감성 결과별 카운터 증가
            switch (result.getSentiment()) {
                case "POSITIVE" -> positiveCounter.increment();
                case "NEGATIVE" -> negativeCounter.increment();
                default -> neutralCounter.increment();
            }
            savedCount++;
        }

        log.info("감성 분석 완료 - 신규 {}건 저장", savedCount);
    }
}

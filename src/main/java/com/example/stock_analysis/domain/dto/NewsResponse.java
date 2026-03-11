package com.example.stock_analysis.domain.dto;

import com.example.stock_analysis.domain.entity.NewsArticle;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

/** 뉴스 API 응답용 DTO - Redis 직렬화를 위해 Serializable 구현 */
@Getter
@NoArgsConstructor
public class NewsResponse implements Serializable {

    private String headline;
    private String summary;
    private String url;
    private String source;
    private String sentiment;
    private String sentimentReason;
    private Instant publishedAt;

    private NewsResponse(String headline, String summary, String url, String source,
                         String sentiment, String sentimentReason, Instant publishedAt) {
        this.headline = headline;
        this.summary = summary;
        this.url = url;
        this.source = source;
        this.sentiment = sentiment;
        this.sentimentReason = sentimentReason;
        this.publishedAt = publishedAt;
    }

    public static NewsResponse from(NewsArticle article) {
        return new NewsResponse(
                article.getHeadline(),
                article.getSummary(),
                article.getUrl(),
                article.getSource(),
                article.getSentiment(),
                article.getSentimentReason(),
                article.getPublishedAt()
        );
    }
}

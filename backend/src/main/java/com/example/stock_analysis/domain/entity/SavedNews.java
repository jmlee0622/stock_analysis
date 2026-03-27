package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** 스크랩한 뉴스 기사 엔티티 */
@Entity
@Table(
    name = "saved_news",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "news_id"})
)
@Getter
@NoArgsConstructor
public class SavedNews {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "news_id", nullable = false)
    private Long newsId;

    // 재조회 없이 바로 보여줄 핵심 필드 저장
    @Column(columnDefinition = "TEXT")
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String url;

    private String sentiment;
    private String source;
    private String category;

    @Setter
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "saved_at", nullable = false)
    private Instant savedAt;

    @Builder
    public SavedNews(Long userId, Long newsId, String headline, String url,
                     String sentiment, String source, String category) {
        this.userId    = userId;
        this.newsId    = newsId;
        this.headline  = headline;
        this.url       = url;
        this.sentiment = sentiment;
        this.source    = source;
        this.category  = category;
        this.isRead    = false;
        this.savedAt   = Instant.now();
    }
}

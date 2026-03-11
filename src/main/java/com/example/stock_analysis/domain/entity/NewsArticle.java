package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** news_articles 테이블과 매핑되는 뉴스 기사 및 감성 분석 결과 엔티티 */
@Entity
@Table(name = "news_articles")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long newsId; // Finnhub 뉴스 ID (중복 저장 방지용)

    private String headline; // 뉴스 제목

    @Column(columnDefinition = "TEXT")
    private String summary; // 뉴스 내용 요약

    private String url;

    private String source; // 뉴스 출처 (Reuters, CoinDesk 등)

    private Instant publishedAt; // 뉴스 발행 시각

    private String sentiment; // 감성 분석 결과: POSITIVE / NEGATIVE / NEUTRAL

    @Column(columnDefinition = "TEXT")
    private String sentimentReason; // 감성 판단 이유

    private Instant analyzedAt; // 감성 분석 수행 시각
}

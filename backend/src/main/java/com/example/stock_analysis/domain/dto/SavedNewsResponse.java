package com.example.stock_analysis.domain.dto;

import java.time.Instant;

/** 스크랩 뉴스 응답 DTO */
public record SavedNewsResponse(
        Long newsId,
        String headline,
        String url,
        String sentiment,
        String source,
        String category,
        boolean isRead,
        Instant savedAt
) {}

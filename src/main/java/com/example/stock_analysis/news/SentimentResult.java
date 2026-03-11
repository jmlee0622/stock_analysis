package com.example.stock_analysis.news;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Claude API 감성 분석 결과를 담는 클래스 (POSITIVE / NEGATIVE / NEUTRAL + 이유) */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SentimentResult {

    private String sentiment; // POSITIVE / NEGATIVE / NEUTRAL
    private String reason;    // 판단 이유

    public SentimentResult(String sentiment, String reason) {
        this.sentiment = sentiment;
        this.reason = reason;
    }
}

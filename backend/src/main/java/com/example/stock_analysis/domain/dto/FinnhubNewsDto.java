package com.example.stock_analysis.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Finnhub REST API에서 수신한 뉴스 데이터를 파싱하는 DTO */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FinnhubNewsDto {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("headline")
    private String headline;

    @JsonProperty("summary")
    private String summary;

    @JsonProperty("url")
    private String url;

    @JsonProperty("source")
    private String source;

    @JsonProperty("datetime")
    private Long datetime; // Unix timestamp (초 단위)
}

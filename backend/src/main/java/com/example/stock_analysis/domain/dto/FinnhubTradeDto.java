package com.example.stock_analysis.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/** Finnhub WebSocket에서 수신한 거래 메시지를 파싱하는 DTO */
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FinnhubTradeDto {

    @JsonProperty("type")
    private String type;

    @JsonProperty("data")
    private List<TradeData> data;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TradeData {

        @JsonProperty("s")
        private String symbol;

        @JsonProperty("p")
        private Double price;

        @JsonProperty("v")
        private Double volume;

        @JsonProperty("t")
        private Long timestamp; // milliseconds
    }
}

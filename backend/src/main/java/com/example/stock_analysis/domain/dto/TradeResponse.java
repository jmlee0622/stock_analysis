package com.example.stock_analysis.domain.dto;

import com.example.stock_analysis.domain.entity.StockTrade;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

/** 시세 API 응답용 DTO - Redis 직렬화를 위해 Serializable 구현 */
@Getter
@NoArgsConstructor
public class TradeResponse implements Serializable {

    private String symbol;
    private Double price;
    private Double volume;
    private Instant tradeTime;

    public TradeResponse(String symbol, Double price, Double volume, Instant tradeTime) {
        this.symbol = symbol;
        this.price = price;
        this.volume = volume;
        this.tradeTime = tradeTime;
    }

    public static TradeResponse from(StockTrade trade) {
        return new TradeResponse(trade.getSymbol(), trade.getPrice(), trade.getVolume(), trade.getTradeTime());
    }
}

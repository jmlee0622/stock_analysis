package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** stock_trades 테이블과 매핑되는 실시간 거래 데이터 엔티티 */
@Entity
@Table(name = "stock_trades")
@Getter
@NoArgsConstructor
public class StockTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Double volume;

    @Column(nullable = false)
    private Instant tradeTime;

    @Builder
    public StockTrade(String symbol, Double price, Double volume, Instant tradeTime) {
        this.symbol = symbol;
        this.price = price;
        this.volume = volume;
        this.tradeTime = tradeTime;
    }
}

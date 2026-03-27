package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/** 포트폴리오 보유 종목 엔티티 */
@Entity
@Table(name = "portfolio")
@Getter
@NoArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String symbol;

    @Column(name = "asset_type", nullable = false)
    private String assetType; // COIN / STOCK

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal quantity;

    @Column(name = "avg_price", nullable = false, precision = 20, scale = 4)
    private BigDecimal avgPrice;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Builder
    public Portfolio(Long userId, String symbol, String assetType,
                     BigDecimal quantity, BigDecimal avgPrice) {
        this.userId    = userId;
        this.symbol    = symbol;
        this.assetType = assetType;
        this.quantity  = quantity;
        this.avgPrice  = avgPrice;
        this.createdAt = Instant.now();
    }
}

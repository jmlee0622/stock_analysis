package com.example.stock_analysis.domain.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 관심종목 테이블과 매핑되는 엔티티
 *
 * assetType: "COIN" 또는 "STOCK"
 */
@Entity
@Table(
    name = "watchlist",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "symbol"})
)
@Getter
@NoArgsConstructor
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String symbol;

    @Column(name = "asset_type", nullable = false)
    private String assetType; // COIN / STOCK

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Builder
    public Watchlist(Long userId, String symbol, String assetType) {
        this.userId = userId;
        this.symbol = symbol;
        this.assetType = assetType;
        this.createdAt = Instant.now();
    }
}

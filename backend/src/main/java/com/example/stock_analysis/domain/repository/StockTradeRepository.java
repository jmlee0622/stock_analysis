package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.StockTrade;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** stock_trades 테이블에 대한 JPA 리포지토리 - 심볼별 최신 데이터 조회 메서드 제공 */
public interface StockTradeRepository extends JpaRepository<StockTrade, Long> {

    // symbol별 가장 최신 데이터 1건
    Optional<StockTrade> findTopBySymbolOrderByTradeTimeDesc(String symbol);

    // 지원하는 심볼 목록 조회용
    List<StockTrade> findTop2BySymbolInOrderByTradeTimeDesc(List<String> symbols);

    // 차트용: symbol별 최근 N건 (시간 역순)
    List<StockTrade> findBySymbolOrderByTradeTimeDesc(String symbol, Pageable pageable);

    // 차트용: symbol + 시간 범위 기반 조회 (오래된 순)
    List<StockTrade> findBySymbolAndTradeTimeAfterOrderByTradeTimeAsc(String symbol, Instant after);
}

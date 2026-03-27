package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** watchlist 테이블에 대한 JPA 리포지토리 */
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUserId(Long userId);

    boolean existsByUserIdAndSymbol(Long userId, String symbol);

    void deleteByUserIdAndSymbol(Long userId, String symbol);
}

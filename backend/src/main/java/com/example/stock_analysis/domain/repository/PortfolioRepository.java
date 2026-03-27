package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    List<Portfolio> findByUserId(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}

package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.SavedNews;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedNewsRepository extends JpaRepository<SavedNews, Long> {

    List<SavedNews> findByUserIdOrderBySavedAtDesc(Long userId);

    Optional<SavedNews> findByUserIdAndNewsId(Long userId, Long newsId);

    boolean existsByUserIdAndNewsId(Long userId, Long newsId);

    void deleteByUserIdAndNewsId(Long userId, Long newsId);
}

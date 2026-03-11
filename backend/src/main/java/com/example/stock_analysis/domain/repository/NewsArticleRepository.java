package com.example.stock_analysis.domain.repository;

import com.example.stock_analysis.domain.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** news_articles 테이블에 대한 JPA 리포지토리 - 중복 확인 및 감성별 뉴스 조회 제공 */
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    // newsId로 이미 저장된 뉴스인지 확인 (중복 방지)
    boolean existsByNewsId(Long newsId);

    // 최신순 뉴스 조회 (sentiment 필터 없이)
    List<NewsArticle> findTop20ByOrderByPublishedAtDesc();

    // sentiment로 필터링해서 최신순 조회
    List<NewsArticle> findTop20BySentimentOrderByPublishedAtDesc(String sentiment);
}

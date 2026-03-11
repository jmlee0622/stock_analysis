package com.example.stock_analysis.news;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** 뉴스 수집 및 감성 분석을 주기적으로 실행하는 스케줄러 (1시간마다) */
@Component
@Slf4j
@RequiredArgsConstructor
public class NewsScheduler {

    private final NewsService newsService;

    // 앱 시작 후 10초 뒤 첫 실행, 이후 1시간마다 반복
    // @Scheduled(initialDelay = 10000, fixedDelay = 3600000)  // API 비용 절약을 위해 비활성화
    public void scheduleNewsFetch() {
        log.info("===== 뉴스 수집 및 감성 분석 시작 =====");
        newsService.fetchAndAnalyzeNews();
    }
}

package com.example.stock_analysis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** 애플리케이션 진입점 - Spring Boot 시작 및 스케줄링 활성화 */
@SpringBootApplication
@EnableScheduling
public class StockAnalysisApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockAnalysisApplication.class, args);
    }

}


package com.example.stock_analysis.domain.dto;

import java.math.BigDecimal;

/** 포트폴리오 보유 종목 응답 DTO (현재가·수익률 계산은 프론트에서) */
public record PortfolioResponse(
        Long id,
        String symbol,
        String assetType,
        BigDecimal quantity,
        BigDecimal avgPrice
) {}

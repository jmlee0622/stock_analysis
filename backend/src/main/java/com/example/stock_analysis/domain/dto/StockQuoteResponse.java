package com.example.stock_analysis.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 주식 현재가 응답 DTO */
@Getter
@AllArgsConstructor
public class StockQuoteResponse {
    private String symbol;
    private double price;
    private double change;      // 전일 대비 변동액
    private double changePct;   // 전일 대비 변동률 (%)
    private double high;        // 당일 고가
    private double low;         // 당일 저가
}

package com.example.stock_analysis.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 암호화폐 현재가 응답 DTO - 변동률 포함 */
@Getter
@AllArgsConstructor
public class CryptoQuoteResponse {
    private String symbol;
    private double price;
    private double change;      // 전일 대비 변동액
    private double changePct;   // 전일 대비 변동률 (%)
    private double high;        // 24시간 고가
    private double low;         // 24시간 저가
}

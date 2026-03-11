package com.example.stock_analysis.kafka;

import com.example.stock_analysis.domain.dto.FinnhubTradeResponse;
import com.example.stock_analysis.domain.entity.StockTrade;
import com.example.stock_analysis.domain.repository.StockTradeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/** Kafka에서 거래 메시지를 소비해 파싱 후 TimescaleDB에 저장하는 컨슈머 */
@Slf4j
@Component
public class StockConsumer {

    private final StockTradeRepository stockTradeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Counter tradesSavedCounter; // 거래 데이터 저장 횟수 카운터

    public StockConsumer(StockTradeRepository stockTradeRepository, MeterRegistry meterRegistry) {
        this.stockTradeRepository = stockTradeRepository;
        this.tradesSavedCounter = Counter.builder("stock.trades.saved")
                .description("저장된 거래 데이터 총 건수")
                .register(meterRegistry);
    }

    @KafkaListener(topics = "stock-data", groupId = "stock-group")
    public void consume(String message) {
        try {
            FinnhubTradeResponse response = objectMapper.readValue(message, FinnhubTradeResponse.class);

            if (!"trade".equals(response.getType()) || response.getData() == null) {
                return;
            }

            List<StockTrade> trades = response.getData().stream()
                    .map(data -> StockTrade.builder()
                            .symbol(data.getSymbol())
                            .price(data.getPrice())
                            .volume(data.getVolume())
                            .tradeTime(Instant.ofEpochMilli(data.getTimestamp()))
                            .build())
                    .toList();

            stockTradeRepository.saveAll(trades);
            tradesSavedCounter.increment(trades.size()); // 메트릭 카운트
            log.info("DB 저장 완료 - {}건", trades.size());

        } catch (Exception e) {
            log.error("메시지 처리 실패: {}", e.getMessage());
        }
    }
}

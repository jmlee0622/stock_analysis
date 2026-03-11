package com.example.stock_analysis.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/** 수신된 주식 데이터를 Kafka 토픽(stock-data)으로 전송하는 프로듀서 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void send(String topic, String message) {
        kafkaTemplate.send(topic, message);
        log.info("Kafka 전송 완료 - topic: {}, message: {}", topic, message);
    }
}

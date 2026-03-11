package com.example.stock_analysis.config;

import com.example.stock_analysis.kafka.StockProducer;
import com.example.stock_analysis.websocket.FinnhubWebSocketClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

/** Finnhub WebSocket 클라이언트를 API 키와 URL로 초기화하는 설정 클래스 */
@Configuration
public class FinnhubConfig {

    @Value("${finnhub.websocket-url}")
    private String websocketUrl;

    @Value("${finnhub.api-key}")
    private String apiKey;

    @Bean
    public FinnhubWebSocketClient finnhubWebSocketClient(StockProducer stockProducer) throws Exception {
        URI uri = new URI(websocketUrl + "?token=" + apiKey);
        return new FinnhubWebSocketClient(uri, stockProducer);
    }
}

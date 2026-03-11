package com.example.stock_analysis.config;

import com.example.stock_analysis.websocket.FinnhubWebSocketClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** 앱 시작 시 Finnhub WebSocket 연결을 자동으로 실행하는 러너 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketRunner implements ApplicationRunner {

    private final FinnhubWebSocketClient finnhubWebSocketClient;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Finnhub WebSocket 연결 시작...");
        finnhubWebSocketClient.connect();
    }
}

package com.example.stock_analysis.websocket;

import com.example.stock_analysis.kafka.StockProducer;
import lombok.extern.slf4j.Slf4j;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;

/** Finnhub WebSocket에 연결해 실시간 거래 데이터를 수신하고 Kafka로 전달하는 클라이언트 */
@Slf4j
public class FinnhubWebSocketClient extends WebSocketClient {

    private final StockProducer stockProducer;

    public FinnhubWebSocketClient(URI uri, StockProducer stockProducer) {
        super(uri);
        this.stockProducer = stockProducer;
    }

    @Override
    public void onOpen(ServerHandshake handshake) {
        log.info("Finnhub WebSocket 연결 성공");
        send("{\"type\":\"subscribe\",\"symbol\":\"BINANCE:BTCUSDT\"}");
        send("{\"type\":\"subscribe\",\"symbol\":\"BINANCE:ETHUSDT\"}");
    }

    @Override
    public void onMessage(String message) {
        log.info("수신된 데이터: {}", message);
        stockProducer.send("stock-data", message);
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        log.warn("WebSocket 연결 종료 - 코드: {}, 이유: {}", code, reason);
    }

    @Override
    public void onError(Exception ex) {
        log.error("WebSocket 에러 발생: {}", ex.getMessage());
    }
}

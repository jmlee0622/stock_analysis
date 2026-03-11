# 클래스 흐름 정리

## 앱 시작 흐름

### 1단계 - Spring Boot 초기화

```
StockAnalysisApplication.main()
  └── @SpringBootApplication  → 모든 Bean 스캔 및 등록
  └── @EnableScheduling       → 스케줄러 활성화
```

---

### 2단계 - Bean 등록 (설정 클래스들)

```
FinnhubConfig           → FinnhubWebSocketClient Bean 생성 (API 키 + URL 주입)
RedisConfig             → RedisCacheManager Bean 생성 (캐시별 TTL 설정)
ChromaConfig            → EmbeddingModel(AllMiniLmL6V2) + ChromaEmbeddingStore Bean 생성
CorsConfig              → CORS 설정 (localhost:5173 허용)
SecurityConfig          → JwtFilter 등록, 경로별 인증 규칙 설정, CORS 적용
```

---

### 3단계 - 앱 시작 직후 자동 실행

```
WebSocketRunner.run()
  └── FinnhubWebSocketClient.connect()
        └── onOpen()  → BINANCE:BTCUSDT, BINANCE:ETHUSDT 구독 신청
```

---

## 실시간 거래 데이터 흐름

```
[Finnhub 서버]
    │  WebSocket 메시지 수신
    ▼
FinnhubWebSocketClient.onMessage()
    │  원본 JSON 문자열 그대로 전달
    ▼
StockProducer.send("stock-data", message)
    │  Kafka 토픽(stock-data)에 발행
    ▼
StockConsumer.consume()               ← @KafkaListener 항상 대기
    │  FinnhubTradeResponse로 JSON 파싱
    │  type == "trade" 인 경우만 처리
    │  StockTrade 엔티티 생성
    ▼
StockTradeRepository.saveAll()
    │  TimescaleDB stock_trades 테이블에 저장
    ▼
tradesSavedCounter.increment()        → Prometheus 메트릭 기록
```

---

## 뉴스 감성 분석 흐름 (스케줄)

```
NewsScheduler.scheduleNewsFetch()     ← @Scheduled (시작 10초 후, 이후 1시간마다)
    ▼
NewsService.fetchAndAnalyzeNews()
    │  Finnhub REST API 호출 → FinnhubNewsDto[] 파싱
    │  newsArticleRepository.existsByNewsId()  → 중복 체크
    ▼
SentimentAnalysisService.analyze()
    │  Claude API 호출 (LangChain4j AnthropicChatModel)
    │  응답 JSON 파싱 → SentimentResult (sentiment + reason)
    ▼
NewsArticleRepository.save()
    │  news_articles 테이블에 저장
    ▼
NewsVectorService.storeNewsEmbedding()
    │  AllMiniLmL6V2로 텍스트 → 벡터 변환
    │  메타데이터(newsId, sentiment, headline, url) 포함
    ▼
ChromaEmbeddingStore.add()
    │  ChromaDB에 벡터 저장
    ▼
positiveCounter / negativeCounter / neutralCounter  → Prometheus 메트릭 기록
```

---

## JWT 인증 흐름

```
POST /auth/register?username=admin&password=1234
    ▼
AuthController.register()
    ▼
AuthService.register()
    │  BCrypt로 비밀번호 암호화
    ▼
UserRepository.save()    → users 테이블에 저장

─────────────────────────────────────────────

POST /auth/login?username=admin&password=1234
    ▼
AuthController.login()
    ▼
AuthService.login()
    │  UserRepository로 유저 조회
    │  BCrypt로 비밀번호 검증
    ▼
JwtUtil.generateToken()  → JWT 토큰 발급 (유효기간 24시간)
    ▼
{ "token": "eyJhbGci..." } 반환
```

---

## REST API 요청 흐름 (JWT 인증 포함)

```
클라이언트 HTTP 요청
Authorization: Bearer eyJhbGci...
    │
    ▼
JwtFilter (모든 요청마다 실행)
    │  헤더에서 토큰 추출
    │  JwtUtil.isValid() → 유효성 검증
    │  유효하면 → SecurityContext에 인증 등록
    │  없거나 위조 → 403 반환
    │
    ├── POST /auth/register, /auth/login  → 토큰 없어도 통과 (permitAll)
    │
    ├── GET /api/trades/latest
    │       ▼
    │   TradeController.getLatest()
    │       ▼
    │   TradeService.getLatestBySymbol() / getLatestAll()
    │       │  @Cacheable → Redis에 캐시 있으면 즉시 반환 (TTL: 5초)
    │       │  캐시 없으면 → StockTradeRepository 조회
    │       ▼
    │   TradeResponse 반환
    │
    ├── GET /api/news
    │       ▼
    │   NewsController.getNews()
    │       ▼
    │   NewsQueryService.getLatestNews() / getNewsBySentiment()
    │       │  @Cacheable → Redis에 캐시 있으면 즉시 반환 (TTL: 1시간)
    │       │  캐시 없으면 → NewsArticleRepository 조회
    │       ▼
    │   NewsResponse 반환
    │
    ├── GET /api/news/search?q=bitcoin
    │       ▼
    │   NewsController.searchNews()
    │       ▼
    │   NewsVectorService.searchSimilarNews()
    │       │  검색어 → AllMiniLmL6V2로 벡터 변환
    │       │  ChromaDB 유사도 검색
    │       ▼
    │   score + headline + sentiment + url 반환
    │
    └── POST /api/news/migrate
            ▼
        NewsVectorService.migrateExistingNews()
            │  TimescaleDB 전체 뉴스 조회
            │  각 뉴스 벡터 변환 후 ChromaDB 저장
            ▼
        저장 건수 반환
```

---

## 전체 구조 한눈에 보기

```
┌─────────────────────────────────────────────────────────┐
│                   외부 데이터 소스                         │
│  Finnhub WebSocket (실시간)   Finnhub REST API (뉴스)     │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │ (1시간마다)
             ▼                          ▼
  FinnhubWebSocketClient          NewsService
             │                          │
             ▼                          ▼
       StockProducer            SentimentAnalysisService
             │                    (Claude API 호출)
             ▼                          │
    Kafka (stock-data)                  │
             │                          │
             ▼                          ▼
       StockConsumer            NewsArticleRepository
             │                          │
             ▼                          ▼
  StockTradeRepository          NewsArticleRepository
             │                          │
             ▼                          ▼
  [TimescaleDB - stock_trades]  [TimescaleDB - news_articles]
                                        │
                                        ▼
                                 NewsVectorService
                                 (AllMiniLmL6V2 임베딩)
                                        │
                                        ▼
                                 [ChromaDB - news-embeddings]
             │
             └────────────────────────────────┐
                                              │
                                    ┌─────────▼──────────┐
                                    │   Redis 캐시 레이어  │
                                    └─────────┬──────────┘
                                              │
                                    TradeService / NewsQueryService
                                              │
                                    ┌─────────▼──────────┐
                                    │      JwtFilter      │
                                    │  토큰 검증 후 통과   │
                                    └─────────┬──────────┘
                                              │
                                    TradeController / NewsController
                                    AuthController
                                              │
                                    ┌─────────▼──────────┐
                                    │  React 프론트엔드   │
                                    │  localhost:5173     │
                                    │  시세/뉴스/검색 화면 │
                                    └────────────────────┘
```

---

## 핵심 포인트

| 클래스 | 역할 |
|---|---|
| `WebSocketRunner` | 앱 시작의 트리거 - WebSocket 연결 시작 |
| `FinnhubWebSocketClient` | Finnhub 서버와 WebSocket 연결 유지 및 데이터 수신 |
| `StockProducer` | 수신 데이터를 Kafka에 발행 |
| `StockConsumer` | Kafka를 항상 리스닝하며 DB에 저장 |
| `NewsScheduler` | 주기적으로 뉴스 파이프라인 가동 |
| `NewsService` | 뉴스 수집 → 중복 제거 → 감성 분석 → 저장 |
| `SentimentAnalysisService` | Claude API로 감성 분석 수행 |
| `TradeService` / `NewsQueryService` | Redis 캐시를 활용한 조회 서비스 |
| `TradeController` / `NewsController` | HTTP 요청을 받아 서비스로 위임 |
| `JwtUtil` | JWT 토큰 생성 및 검증 |
| `JwtFilter` | 모든 요청에서 토큰 유효성 검사 |
| `AuthService` | 회원가입(BCrypt 암호화) + 로그인(JWT 발급) |
| `AuthController` | POST /auth/register, POST /auth/login 엔드포인트 |
| `SecurityConfig` | 공개/보호 경로 설정 및 JwtFilter 등록 |
| `ChromaConfig` | EmbeddingModel + ChromaEmbeddingStore 빈 등록 |
| `CorsConfig` | React 프론트엔드(5173) CORS 허용 |
| `NewsVectorService` | ChromaDB 벡터 저장/검색/마이그레이션 |

---

## API 엔드포인트 목록

| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| POST | /auth/register | 불필요 | 회원가입 |
| POST | /auth/login | 불필요 | 로그인 + JWT 발급 |
| GET | /api/trades/latest | 필요 | BTC + ETH 최신 시세 |
| GET | /api/trades/latest?symbol= | 필요 | 특정 심볼 시세 |
| GET | /api/news | 필요 | 최신 뉴스 20건 |
| GET | /api/news?sentiment= | 필요 | 감성별 뉴스 필터링 |
| GET | /api/news/search?q= | 필요 | ChromaDB 유사도 검색 |
| POST | /api/news/migrate | 필요 | 기존 뉴스 ChromaDB 마이그레이션 |

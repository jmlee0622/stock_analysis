# Stock Analysis Project

## 프로젝트 구조
```
백엔드:    C:\Users\이종민\IdeaProjects\stock_analysis\backend
프론트엔드: C:\Users\이종민\IdeaProjects\stock-frontend
Docker:    C:\Users\이종민\dev\stock-analysis\docker-compose.yml
```

## 기술 스택

### 백엔드
- Java 25, Spring Boot 4.0.3, Gradle
- Spring Security 7 (JWT + OAuth2 소셜 로그인)
- Spring Data JPA (TimescaleDB/PostgreSQL)
- Spring Data Redis (캐싱)
- Kafka (실시간 주식 데이터)
- Lombok, jjwt 0.12.6

### 프론트엔드
- Vite + React
- Shadcn UI, Recharts, D3.js
- axios (api/axios.js에서 baseURL, 토큰 인터셉터 관리)

### 인프라 (Docker)
| 서비스 | 포트 |
|--------|------|
| TimescaleDB (PostgreSQL) | 5432 |
| Redis | 6379 |
| Kafka | 9092 |
| Zookeeper | 2181 |
| Prometheus | 9090 |
| Grafana | 3000 |
| ChromaDB | 8000 |

## 패키지 구조
```
com.example.stock_analysis
├── api/          - REST 컨트롤러 (Stock, News, Trade)
├── auth/         - JWT 인증 (AuthController, AuthService, JwtUtil, JwtFilter)
│   └── oauth2/   - 소셜 로그인 (CustomOAuth2UserService, OAuth2SuccessHandler)
├── config/       - 설정 (SecurityConfig, CorsConfig, RedisConfig 등)
├── domain/
│   ├── entity/   - User, NewsArticle, StockTrade
│   ├── dto/      - 응답 DTO
│   └── repository/
├── kafka/        - StockProducer, StockConsumer
├── news/         - 뉴스 수집, 감성 분석, 벡터 검색
└── service/      - 주식/코인 시세, 거래 서비스
```

## 인증 방식
- **일반 로그인**: POST /auth/login (RequestBody JSON) → JWT 반환
- **소셜 로그인**: /oauth2/authorization/google or /oauth2/authorization/naver
  - 성공 시 프론트엔드로 리다이렉트: `http://localhost:5173/?token=xxx&username=xxx`
  - App.jsx에서 URL 파라미터로 token 꺼내서 localStorage 저장

## 설정 파일
- `application.yml` - 공통 설정 (CHANGE_ME 플레이스홀더)
- `application-local.yml` - 실제 시크릿 값 (gitignore, 로컬 전용)
  - DB 비밀번호, JWT secret, OAuth2 client-id/secret, API 키 등

## DB 스키마 (users 테이블)
```sql
id          BIGINT        PK
username    VARCHAR       UNIQUE NOT NULL
password    VARCHAR       NULL (소셜 로그인 유저는 null)
provider    VARCHAR       NOT NULL DEFAULT 'local'  (local/google/naver)
provider_id VARCHAR       NULL (소셜 로그인 유저의 고유 ID)
```

## Docker 실행 방법
```bash
cd C:\Users\이종민\dev\stock-analysis
docker-compose up -d
```

## 로컬 개발 실행 순서
1. Docker Desktop 실행
2. `docker-compose up -d` (TimescaleDB, Redis, Kafka 등)
3. IntelliJ에서 Spring Boot 실행
4. `cd stock-frontend && npm run dev`

## CORS
- 허용 origin: `http://localhost:5173`

## 주요 환경변수 (application-local.yml)
```yaml
spring:
  datasource.password: stock1234
  security.oauth2.client.registration:
    google: { client-id: ..., client-secret: ... }
    naver:  { client-id: ..., client-secret: ... }
jwt:
  secret: (256bit 이상)
finnhub.api-key: ...
huggingface.api-key: ...
```

## 코딩 규칙
- DTO는 Java record 타입 사용
- Lombok @Slf4j + log.info/error (System.out.println 금지)
- @RequestBody로 요청 수신 (민감 정보는 URL 노출 금지)
- 시크릿/키는 application-local.yml에만 작성

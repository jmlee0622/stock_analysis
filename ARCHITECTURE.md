# 프로젝트 아키텍처 정리

## 데이터 흐름 구조

### 코인 (BTC, ETH)
```
Finnhub WebSocket (실시간 체결)
        ↓
FinnhubWebSocketClient → Kafka Producer
        ↓
Kafka → StockConsumer
        ↓
TimescaleDB (stock_trades 테이블에 이력 누적)
        ↓
프론트 5초마다 /api/trades/latest 호출 → DB에서 조회
```

### 주식 (NVDA, AAPL 등)
```
프론트 30초마다 /api/stocks/latest 호출
        ↓
StockQuoteService → Finnhub REST API (현재가)
                 → Yahoo Finance API (차트)
        ↓
DB 저장 없이 바로 반환
```

### 뉴스
```
NewsScheduler (1시간마다 자동 실행)
        ↓
Finnhub REST API → FinnhubNewsDto (입력 파싱용)
        ↓
HuggingFace FinBERT → 감성 분석 (POSITIVE / NEGATIVE / NEUTRAL)
        ↓
TimescaleDB (news_articles 테이블)
        ↓ @CacheEvict로 Redis 캐시 초기화
프론트 /api/news 호출 → Redis 캐시 → DB 조회
```

---

## 코인 vs 주식 데이터 방식 차이

| | 코인 | 주식 |
|--|------|------|
| 데이터 수신 | WebSocket 실시간 스트림 | REST API 폴링 |
| DB 저장 | O (stock_trades에 누적) | X (바로 반환) |
| 차트 데이터 | 우리 DB 이력 | Yahoo Finance API |
| 이유 | Finnhub 무료 플랜에서 코인 WebSocket 지원 | 주식 WebSocket은 유료 플랜만 지원 |

---

## DTO 역할 구분

### 입력용 (외부 → 우리 서버)
| DTO | 출처 | 용도 |
|-----|------|------|
| `FinnhubNewsDto` | Finnhub REST API | 뉴스 JSON 파싱 |
| `FinnhubTradeDto` | Finnhub WebSocket | 코인 체결 데이터 파싱 |

### 출력용 (우리 서버 → 프론트)
| DTO | 용도 |
|-----|------|
| `NewsResponse` | 뉴스 응답 (감성 분석 결과 포함) |
| `TradeResponse` | 코인 체결 이력 응답 (차트용) |
| `CryptoQuoteResponse` | 코인 현재가 요약 (고가/저가/변동률) |
| `StockQuoteResponse` | 주식 현재가 요약 |

---

## 인증 구조

```
일반 로그인
POST /auth/login (RequestBody JSON)
        ↓
AuthService → BCrypt 비밀번호 검증
        ↓
JWT 발급 → 프론트 localStorage 저장

소셜 로그인 (Google / Naver)
window.location.href → /oauth2/authorization/{provider}
        ↓
Spring Security → 구글/네이버 로그인 페이지
        ↓
콜백: /login/oauth2/code/{provider}
        ↓
CustomOAuth2UserService → DB 저장 (자동 회원가입)
        ↓
OAuth2SuccessHandler → JWT 발급
        ↓
프론트 리다이렉트: /?token=xxx&username=xxx
```

### users 테이블
| 컬럼 | 설명 |
|------|------|
| username | 아이디 (소셜 로그인은 이메일) |
| password | 일반 로그인만 사용, 소셜은 null |
| provider | local / google / naver |
| provider_id | 소셜 제공자의 고유 ID |

---

## 앞으로 추가할 기능

### 1단계 (예정)
- [ ] 관심종목 스크랩 (userId + symbol DB 저장, 북마크 버튼)
- [ ] 마이페이지 (프로필, 스크랩 목록, 비밀번호 변경)
- [ ] 가격 알림 (목표가 설정 → Web Notification API)

---

## 수정 필요 사항

- [ ] `StockPage` 검색 기능 개선 (현재 목록에서 필터링만 함, 외부 종목 검색 안 됨)
- [ ] 주식 WebSocket 미지원 → 현재 30초 폴링으로 대체 중

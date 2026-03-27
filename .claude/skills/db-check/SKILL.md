---
name: db-check
description: TimescaleDB에 접속해서 주요 테이블 상태를 확인한다. "DB 확인", "테이블 확인", "유저 조회" 등을 요청할 때 사용.
allowed-tools: Bash
---

다음 쿼리들을 순서대로 실행하고 결과를 보여주세요:

1. 테이블 목록 확인
```bash
docker exec timescaledb psql -U stock -d stockdb -c "\dt"
```

2. users 테이블 조회
```bash
docker exec timescaledb psql -U stock -d stockdb -c "SELECT id, username, provider, provider_id FROM users LIMIT 10;"
```

3. 각 테이블 행 수 확인
```bash
docker exec timescaledb psql -U stock -d stockdb -c "SELECT 'users' as table_name, COUNT(*) FROM users UNION ALL SELECT 'news_articles', COUNT(*) FROM news_articles UNION ALL SELECT 'stock_trades', COUNT(*) FROM stock_trades;"
```

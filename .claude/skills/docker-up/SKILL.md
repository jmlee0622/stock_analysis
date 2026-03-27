---
name: docker-up
description: 주식 프로젝트 Docker 컨테이너 상태를 확인하고 꺼진 것들을 재시작한다. "도커 실행", "도커 켜줘", "컨테이너 시작" 등을 요청할 때 사용.
allowed-tools: Bash
---

다음 순서로 실행하세요:

1. `docker ps --format "table {{.Names}}\t{{.Status}}"` 로 현재 상태 확인
2. 꺼진 컨테이너가 있으면 `cd C:\Users\이종민\dev\stock-analysis && docker-compose up -d` 실행
3. 다시 상태 확인 후 결과 보고

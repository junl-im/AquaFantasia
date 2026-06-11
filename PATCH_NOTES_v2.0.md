# Patch 09 - v2.0 Actions Rank Visual Max

## 핵심

- GitHub Actions 자동 배포 워크플로 추가
- Push 시 정적 파일 검증 후 GitHub Pages 배포
- 시즌 랭킹 UI 추가
- 보스 토벌 랭킹 UI 추가
- Firestore `bossLeaderboard/{uid}` 규칙 추가
- PWA/성능 버튼 연결 함수 복구 및 강화
- Service Worker 캐시 버전 `v2.0.0` 갱신
- Manifest 버전/설명 갱신

## GitHub Actions

추가 파일:

```text
.github/workflows/pages.yml
tools/validate-static.mjs
package.json
```

워크플로 순서:

1. Checkout
2. Node.js 22 설정
3. `node tools/validate-static.mjs` 실행
4. GitHub Pages 설정
5. 정적 사이트 아티팩트 업로드
6. Pages 배포

## 그래픽/성능

- 랭킹 패널 전용 홀로그램 스캔 효과
- 자동 배포 상태 카드 광원 효과
- 시즌 트로피 float 애니메이션
- FPS 측정 함수 복구
- 저성능 기기 자동 절전 그래픽 전환
- PWA 설치/오프라인 상태 표시 함수 복구

## Firebase

v2.0 Firestore 컬렉션:

```text
users/{uid}
leaderboard/{uid}
bossLeaderboard/{uid}
```

`firestore.rules`를 Firebase 콘솔에 다시 반영해야 보스 랭킹 제출이 동작합니다.

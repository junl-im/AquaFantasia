# CLEAN REPLACE GUIDE v7.6.0

1. ZIP을 풀어 기존 GitHub Pages/Vite 프로젝트 루트에 그대로 덮어씁니다.
2. GitHub Desktop에서 변경 파일을 확인한 뒤 commit/push 합니다.
3. GitHub Actions가 `npm run validate`, `typecheck`, `build`를 통과하면 Pages 배포가 갱신됩니다.
4. 모바일에서 캐시가 남으면 브라우저/PWA를 새로고침하거나 앱 데이터를 지운 뒤 재접속하세요. 서비스워커 캐시명은 v7.6.0으로 갱신되어 이전 캐시를 자동 정리합니다.

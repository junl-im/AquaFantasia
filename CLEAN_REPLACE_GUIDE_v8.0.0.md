# CLEAN REPLACE GUIDE v8.0.0

## 덮어쓰기 방식

1. 기존 GitHub Desktop 프로젝트 폴더를 연다.
2. 이 ZIP의 내용을 프로젝트 루트에 그대로 덮어쓴다.
3. 터미널에서 아래 명령을 실행한다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

4. GitHub Desktop에서 변경 파일을 확인하고 commit/push 한다.
5. GitHub Pages 배포가 완료된 뒤 모바일에서 아래를 확인한다.
   - 시작 화면 `익명 서버연동`과 `이 기기에서 로그인 유지`가 겹치지 않는지
   - 장비/상점/미션 화면이 정상적으로 보이고 스크롤되는지
   - 하단 네비게이션이 드래그 중에도 최하단 고정인지
   - 낚시 화면 배경/물고기/보트가 렌더드 느낌인지

## 주의

`node_modules`는 ZIP에 포함하지 않습니다. 로컬에서 `npm install`로 복구하세요.

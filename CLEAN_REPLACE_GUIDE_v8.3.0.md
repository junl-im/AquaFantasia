# CLEAN REPLACE GUIDE v8.3.0

## 적용 방법

1. 이 ZIP을 기존 AquaFantasia 프로젝트 루트에 그대로 덮어쓴다.
2. GitHub Desktop에서 변경 사항을 확인한다.
3. 아래 명령으로 로컬 검증을 진행한다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

4. 이상이 없으면 commit / push 한다.
5. GitHub Actions가 Pages 배포를 다시 수행한다.

## 주의

- `node_modules`와 `dist`는 ZIP에 포함하지 않는다.
- v13 탭 화면은 구성도 이미지 기반이므로, 이미지 파일명과 경로를 바꾸면 hotspot 좌표도 함께 점검해야 한다.
- 시작 화면의 `이 기기에서 로그인 유지`는 배경 이미지가 아니라 실제 버튼이다. 삭제하지 말고 `v810-keep-button` 클래스를 유지한다.

## 주요 확인 포인트

- 시작 화면: 출항 / 새 게임 / 익명 서버연동 / 로그인 유지가 겹치지 않는지
- 마을 탭: CTA와 카드 hotspot이 실제 보이는 카드와 맞는지
- 낚시 탭: PixiJS 수면 영역이 v13 낚시 패널 안에 들어오는지
- 장비/상점/미션/가방/도감/랭킹: 하단 탭 터치가 이미지 탭과 맞는지
- 세로 긴 기기: UI가 찌그러지지 않고 좌우 crop 방식으로 유지되는지

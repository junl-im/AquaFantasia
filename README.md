# AquaFantasia v1.0.6

모바일 웹/PWA 낚시 게임 AquaFantasia의 v1.0.6 패치입니다.

## 이번 패치 목표

- 최하단 메뉴바는 테두리 프레임을 더 낮고 슬림하게 정리
- 메뉴 아이콘은 다시 크게 키워서 한눈에 보이게 개선
- 출항/구매/비용/수령 같은 본문 버튼은 아담하게 축소하되 렌더드 질감 유지
- 마을/장비/가방/도감/상점/미션/랭킹은 좌우 스와이프로 탭 이동 지원
- 낚시 화면은 오터치 방지를 위해 스와이프 탭 이동 비활성화
- 콤보 배지는 초기에는 숨김, 연속 성공/캐스팅 흐름에서만 표시
- 랭킹 화면 글자 대비를 밝게 조정
- WebGL 수중 레이어의 둥근 원형 버블 느낌을 아쿠아 물방울/물방울 반짝임 느낌으로 개선
- UI 글자/가격/보상/점수 영역이 프레임 밖으로 나가지 않도록 containment 강화

## 적용 방법

기존 GitHub Pages 프로젝트 루트에 ZIP 내용을 덮어쓴 뒤 실행합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 유지 정책

- `README.md` 단일 문서 정책 유지
- `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES`, `reports` 추가 생성 없음
- Firebase Spark / GitHub Pages / Vite / TypeScript / PixiJS 8 / Howler.js / PWA 구조 유지

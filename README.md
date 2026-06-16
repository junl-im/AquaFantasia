# AquaFantasia v1.0.7

모바일 웹/PWA 낚시 게임 AquaFantasia의 v1.0.7 패치입니다.

## 이번 패치 목표

- v1.0.6의 스와이프/수중 물방울/콤보 구조는 유지
- 하단 메뉴바는 프레임을 더 단정하게 유지하면서 아이콘 가시성 보강
- 메뉴 화면의 스와이프 안내 문구는 제거해서 화면을 더 깔끔하게 정리
- 상점/미션/랭킹/장비/가방/도감 카드의 글자 넘침과 프레임 이탈 추가 차단
- 본문 버튼은 작고 단정하게 유지하되 버튼 글씨가 밖으로 밀리지 않도록 보정
- 낚시 화면의 콤보/낚시 시작/최근 포획/릴 패널 간격을 다시 정리
- 수중 WebGL 레이어는 너무 시끄럽지 않게 낮추고 UI 가독성을 우선

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

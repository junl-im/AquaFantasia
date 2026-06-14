# Aqua Fantasia v8.0.0

모바일 세로 전용 2.5D/렌더드 낚시 웹게임 프로토타입입니다.

## v8.0.0 핵심

- `낚시.zip`의 렌더드 이미지 시트를 기준으로 배경, 물고기, 장비, 하단 네비게이션 아이콘을 다시 추출해 런타임에 반영
- 장비 / 상점 / 미션 화면을 세로 스크롤 카드 UI로 재정렬해 거의 보이지 않던 문제 수정
- 첫 시작 화면의 `익명 서버연동`과 `이 기기에서 로그인 유지` 겹침을 투명 hitbox 구조로 정리
- 낚시 화면 PixiJS 플레이어/찌/물고기 스케일을 새 렌더드 PNG 기준으로 재조정
- 하단 네비게이션은 계속 fixed root nav 구조로 유지
- Firebase 무료 Spark 플랜, PWA, GitHub Pages / GitHub Actions 구조 유지

## 개발 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

## 적용 권장

GitHub Desktop 프로젝트 루트에 ZIP 내용을 덮어쓴 뒤 `npm install`, `npm run validate`, `npm run build` 순서로 확인하세요.

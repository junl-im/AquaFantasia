# Aqua Fantasia v8.1.0

모바일 세로 전용 2.5D/렌더드 낚시 웹게임 프로토타입입니다.

## v8.1.0 핵심

- 새 첨부 에셋 팩을 `public/assets/v12`로 재분류해 실제 런타임에 연결
- 시작 화면의 `이 기기에서 로그인 유지`를 삭제하지 않고 실제 버튼형 UI로 복구
- 시작 화면 배경에 구워진 중복 체크/글씨 영역은 제거해 텍스트 겹침 방지
- 장비 / 상점 / 미션 화면 카드 UI를 모바일 세로 화면 기준으로 다시 안정화
- UI 패널과 버튼은 글씨 없는 blank 렌더드 PNG/WebP 에셋을 사용
- 낚시 화면 PixiJS 플레이어/찌/물고기 스케일을 v12 렌더드 에셋 기준으로 재조정
- 하단 네비게이션은 fixed root nav 구조 유지
- Firebase 무료 Spark 플랜, PWA, GitHub Pages / GitHub Actions 구조 유지

## 개발 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

## 적용 권장

GitHub Desktop 프로젝트 루트에 ZIP 내용을 덮어쓴 뒤 `npm install`, `npm run validate`, `npm run typecheck`, `npm run build` 순서로 확인하세요.

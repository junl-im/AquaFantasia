# AquaFantasia v1.1.13 Detail Stability QA

모바일 웹 낚시 게임 AquaFantasia의 v1.1.13 세부 안정성 QA 패치입니다. v1.1.10의 사용자가 제공한 마을 배경, 마을 흐름, 메뉴 순서, 한 칸씩 좌우 스와이프, 낚시 캐릭터 우측 배치와 v1.1.11~v1.1.12의 기술·성능·콘텐츠 흐름 안정화를 유지하면서, 실제 폰에서 남을 수 있는 작은 문제를 더 촘촘하게 다듬었습니다.

## v1.1.13에서 반영한 부분

- `Detail Stability QA` 레이어 추가
  - `data-detail-stability-qa="v11113-detail-stability-qa"`로 최종 CSS/런타임 가드 분리
  - 기존 v1.1.3의 `v1113-micro-detail-polish` 표기와 충돌하지 않도록 새 표기는 `v11113`을 사용
- 하단 8칸 메뉴바 최종 보정
  - 앱 실제 폭, visualViewport offset, safe-area 기준으로 다시 고정
  - 아이콘/라벨이 너무 작거나 셀 밖으로 밀리지 않도록 작은 화면 라벨 크기와 간격 재조정
- 메뉴 화면 스크롤과 좌우 스와이프 충돌 완화
  - 세로 드래그 의도가 먼저 잡히면 스와이프 추적을 즉시 취소
  - 멀티터치/비주 포인터 입력은 메뉴 이동으로 처리하지 않음
  - 마을 → 장비 → 가방 → 도감 → 상점 → 미션 → 랭킹 → 낚시 순서 유지
  - 낚시 화면 스와이프 이동 비활성화 유지
- 이미지 안정성 가드 추가
  - 중요 이미지 선로딩/비동기 디코딩 추가
  - 메뉴/도감/HUD 이미지 로딩 실패 시 PNG 기반 fallback 이미지로 복구
  - 이미지 드래그 방지로 모바일 롱터치/드래그 흔들림 감소
- 낚시 입력 안정성 보강
  - 릴 패널과 낚시 스테이지에서 `pointerleave`, `lostpointercapture` 발생 시 릴 누름 상태 해제
  - 화면 전환 시 남아 있는 터치 링, 액션 배지, 입질 콜아웃 같은 임시 FX 노드 정리
- 카드/버튼/랭킹/미션 세부 레이아웃 보정
  - 히어로 카드, 상점 카드, 미션 카드, 랭킹 행의 `min-width`, grid, 줄바꿈 방어 강화
  - 버튼 폭은 글씨 길이에 맞게 유지하면서 터치 가능한 최소 높이 확보
  - 금액/무료 계열은 gold 이미지 버튼 톤 유지
  - 진행/도전/채우기/이동 계열은 aqua 이미지 버튼 톤 유지
- 낚시 화면 fixed UI 보정
  - HUD, 최근 포획, 캐스팅 버튼, 릴 패널, 결과 카드가 하단 메뉴바와 겹치지 않도록 v1.1.13 변수로 재보정
- PWA 캐시 버전 갱신
  - `aqua-fantasia-v1.1.13-detail-stability-qa`
  - 기존 HTML navigation 전용 offline fallback 정책 유지
- SVG/벡터 신규 자산 추가 없음
- PNG/WebP 기반 2.5D/3D 렌더링 방향 유지

## 유지된 안전 정책

- v1.1.4 Pixel Perfect Polish 유지
- v1.1.4 `@protobufjs/*` 설치 Hotfix 유지
- v1.1.5 UI Layout Rescue 유지
- v1.1.6 UI Bounds Polish 유지
- v1.1.7 Viewport Safe Lock 유지
- v1.1.8 Layout QA Sweep 유지
- v1.1.9 Interaction QA Polish 유지
- v1.1.10 Village Flow Swipe Polish 유지
- v1.1.11 Tech Perf Compat 유지
- v1.1.12 Content Flow Engine QA 유지
- 사용자가 제공한 마을 배경 유지
- 하단 메뉴 순서 `마을 → 장비 → 가방 → 도감 → 상점 → 미션 → 랭킹 → 낚시` 유지
- 메뉴 화면은 가로 이탈 방지, 세로 내용 초과 시 드래그 스크롤 유지
- PWA offline fallback은 HTML navigation 요청에만 적용

## 설치

```bash
npm ci --ignore-scripts --no-audit --progress=false
npm run validate
npm run typecheck
npm run build
npm run audit
npm run runtime:check
```

로컬에서 빠르게 확인할 때는 기존처럼 아래 명령도 사용할 수 있습니다.

```bash
npm install
npm run build
```

## GitHub Pages / Firebase 배포

```bash
npm run build
```

생성된 `dist/`를 Pages 또는 Firebase Hosting에 배포합니다.

## 버전

- 앱 버전: `1.1.13`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.13-detail-stability-qa`
- 문서 정책: `README.md` 단일 문서 유지

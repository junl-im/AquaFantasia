# AquaFantasia v1.1.9 Interaction QA Polish

모바일 웹 낚시 게임 AquaFantasia의 v1.1.9 상호작용 QA 보강 패치입니다. v1.1.8에서 화면 밖 이탈 방지를 강화한 뒤에도 실제 모바일 브라우저에서 남을 수 있는 fixed UI 흔들림, 터치 차단, 오프라인 캐시 fallback 부작용을 다시 점검했습니다.

이번 패치는 새 기능 추가보다 안정화가 우선입니다. v1.1.1 안전 UI 정책, v1.1.2 Premium 2.5D 엔진, v1.1.3 Micro Detail Polish, v1.1.4 Pixel Perfect Polish, v1.1.4 설치 Hotfix, v1.1.5 Layout Rescue, v1.1.6 UI Bounds Polish, v1.1.7 Viewport Safe Lock, v1.1.8 Layout QA Sweep을 유지합니다.

## 핵심 유지 정책

- README.md 단일 문서 정책 유지
- GitHub Actions 설치 Hotfix 유지
- 신규 SVG/벡터 자산 추가 없음
- PNG/WebP 기반 2.5D/3D 렌더링 방향 유지
- 낚시 화면 스와이프 이동 비활성화 유지
- 하단 메뉴바 8칸 고정 유지
- RuntimeQualityManager와 WebGL/HTML fallback 안전 정책 유지

## v1.1.9에서 다시 점검하고 고친 부분

- 하단 메뉴바 emergency JS 보정이 아직 `100vw` / v1.1.7 변수에 기대던 부분을 v1.1.9 visual viewport 기준으로 정리
- visualViewport의 `offsetLeft`, `offsetTop`을 런타임 CSS 변수로 저장해 일부 모바일 브라우저의 주소창/줌/스크롤 상태에서 fixed UI 기준이 흔들릴 가능성 축소
- 하단 메뉴바를 left/right 동시 계산이 아니라 `left + deterministic width` 방식으로 다시 고정
- fixed 인터랙션 UI의 가로/세로 이탈을 함께 감지하는 `repairFixedInteractiveBounds` 추가
- 낚시 화면의 WebGL/수중 레이어가 버튼 터치를 가로막지 않도록 pointer layer를 한 번 더 잠금
- 하단 메뉴바 버튼, 상점/미션/장비/지역 카드 버튼의 모바일 터치 동작 안정화
- 짧은 높이 화면, 초소형 화면, 키보드/visual viewport 변화 상태에 대한 v1.1.9 class guard 추가
- service worker에서 이미지/JS/CSS 요청 실패 시 `offline.html`을 반환하지 않도록 수정
- PWA / service worker 캐시 버전 갱신
- v1.1.9 검증 스크립트 추가

## 개발 / 검증

```bash
npm ci --ignore-scripts --no-audit --progress=false
npm run validate
npm run runtime:check
npm run audit
npm run typecheck
npm run build
node --check public/sw.js
```

## 적용 후 확인 순서

1. 마을 화면에서 하단 메뉴바 8칸이 모두 화면 안에 있는지 확인합니다.
2. 마을, 낚시, 장비, 가방, 도감, 상점, 미션, 랭킹을 차례대로 눌러 카드/버튼/텍스트가 밖으로 나가지 않는지 확인합니다.
3. 낚시 화면에서 HUD, 최근 포획, 캐스팅 버튼, 릴 패널, 결과 카드가 하단 메뉴바와 겹치지 않는지 확인합니다.
4. 낚시 화면에서 캐스팅 버튼과 릴 패널이 WebGL/수중 레이어에 터치 차단되지 않는지 확인합니다.
5. 360px급 작은 화면, 390px급 일반 폰, 430px급 큰 폰, 태블릿 세로 화면에서 한 번씩 확인합니다.

## 배포 메모

- 앱 버전: `1.1.9`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.9-interaction-qa-polish`
- 패치 형태: 기존 프로젝트 루트에 덮어쓰기
- `node_modules`와 `dist`는 패치 ZIP에서 제외

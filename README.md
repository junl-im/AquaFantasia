# AquaFantasia v1.1.8 Layout QA Sweep

모바일 웹 낚시 게임 AquaFantasia의 v1.1.8 레이아웃 QA 보강 패치입니다. v1.1.7에서 viewport 기준을 잠근 뒤에도 실제 기기에서 남을 수 있는 작은 흔들림을 다시 점검했고, 하단 8칸 메뉴바와 각 메뉴 UI가 화면 밖으로 나가지 않도록 한 겹 더 보수적으로 고정했습니다.

이번 패치는 새 기능 추가보다 안정화가 우선입니다. v1.1.1 안전 UI 정책, v1.1.2 Premium 2.5D 엔진, v1.1.3 Micro Detail Polish, v1.1.4 Pixel Perfect Polish, v1.1.4 설치 Hotfix, v1.1.5 Layout Rescue, v1.1.6 UI Bounds Polish, v1.1.7 Viewport Safe Lock을 유지합니다.

## 핵심 유지 정책

- README.md 단일 문서 정책 유지
- GitHub Actions 설치 Hotfix 유지
- 신규 SVG/벡터 자산 추가 없음
- PNG/WebP 기반 2.5D/3D 렌더링 방향 유지
- 낚시 화면 스와이프 이동 비활성화 유지
- 하단 메뉴바 8칸 고정 유지
- RuntimeQualityManager와 WebGL/HTML fallback 안전 정책 유지

## v1.1.8에서 다시 점검하고 고친 부분

- v1.1.7 패치에서 누락되어 있던 오프라인 페이지 버전 표기 불일치 수정
- README 버전/캐시 설명을 v1.1.8 기준으로 정리
- PWA / service worker 캐시 버전 갱신
- 기존 v1.1.7 검증 스크립트가 새 버전에서 막히지 않도록 lineage 검증으로 보정
- `100vw` 직접 계산 의존도를 줄이고, 런타임에서 측정한 visual viewport / app width 기준을 추가
- 하단 메뉴바 left/right 계산을 `--v118-visual-width`와 `--v118-app-width` 기준으로 재보정
- 메뉴 루트, HUD, 콘텐츠, 카드, 랭킹 패널, 목록 그리드의 `min-width`, `max-width`, `overflow-x` 재정리
- 초소형 화면과 짧은 높이 화면용 별도 guard 추가
- 낚시 HUD, 최근 포획, 릴 패널, 캐스팅 버튼, 결과 카드가 하단 메뉴바와 겹치지 않도록 재보강
- 런타임에서 주요 인터랙션 UI가 앱 밖으로 나가면 emergency class를 붙이는 bounds 감지 추가

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
4. 360px급 작은 화면, 390px급 일반 폰, 430px급 큰 폰, 태블릿 세로 화면에서 한 번씩 확인합니다.

## 배포 메모

- 앱 버전: `1.1.8`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.8-layout-qa-sweep`
- 패치 형태: 기존 프로젝트 루트에 덮어쓰기
- `node_modules`와 `dist`는 패치 ZIP에서 제외

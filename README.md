# AquaFantasia v1.1.11 Tech Perf Compat

모바일 웹 낚시 게임 AquaFantasia의 v1.1.11 기술·성능·호환성 보강 패치입니다. v1.1.10에서 반영한 사용자가 제공한 마을 배경, 마을 첫 화면 흐름, 메뉴 순서, 한 칸씩 좌우 스와이프, 낚시 캐릭터 우측 배치 방향은 유지하면서 실제 모바일 브라우저와 GitHub Actions에서 흔들릴 수 있는 지점을 더 점검했습니다.

## v1.1.11에서 반영한 부분

- GitHub Actions 설치 단계를 `npm install`에서 `npm ci --ignore-scripts --no-audit --progress=false`로 고정
- `package.json`에 `ci:install` 스크립트와 Node 엔진 조건 추가
- PWA service worker 캐시 버전을 `aqua-fantasia-v1.1.11-tech-perf-compat`로 갱신
- service worker navigation preload 지원 브라우저에서 HTML 응답 시작 속도 개선
- service worker가 Range 요청을 가로채지 않도록 보정
- HTML navigation 응답은 성공 응답만 `index.html` 캐시에 저장하도록 보정
- 에셋 캐시는 동일 출처의 정상 응답만 저장하도록 보강
- 저장 데이터 정규화 강화
  - 잘못된 화면 이름, 수역 이름, 숫자 값, 미션/도감 기록이 들어와도 안전하게 기본값 또는 정상 범위로 복구
- RuntimeQualityManager 개선
  - Save-Data / 2G 계열 네트워크 / 저메모리 / 저코어 / reduced motion을 초기 품질 판단에 반영
  - runtime quality class를 루트에 표시해서 CSS와 WebGL 레이어가 같은 품질 정책을 공유
  - visualViewport offset 변수 보강
- WebGL 수중 레이어 개선
  - 런타임 품질 티어 변경 시 기존 레이어도 lite/balanced/high로 즉시 동기화
  - 탭이 백그라운드로 가면 수중 렌더 루프가 불필요한 그리기를 건너뜀
  - 레이어별 품질 상태를 DOM dataset으로 표시
- 낚시 중 브라우저 blur/pagehide/visibilitychange가 발생하면 릴 누름 상태를 해제해 stuck input 가능성 감소
- 메뉴 리스트/카드/수역 목록에 `content-visibility` 기반 스크롤 성능 보강
- fixed 하단 메뉴바 폭 기준을 v1.1.11 앱 폭 변수로 한 번 더 고정
- WebGL/수중/배경 레이어의 pointer/touch 차단 유지
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
- 사용자가 제공한 마을 배경 유지
- 하단 메뉴 순서 `마을 → 장비 → 가방 → 도감 → 상점 → 미션 → 랭킹 → 낚시` 유지
- 낚시 화면 스와이프 이동 비활성화 유지
- 메뉴 화면은 가로 이탈 방지, 세로 내용 초과 시 드래그 스크롤 유지
- PWA offline fallback은 HTML navigation 요청에만 적용

## 설치

```bash
npm ci --ignore-scripts --no-audit --progress=false
npm run validate
npm run typecheck
npm run build
npm run audit
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

- 앱 버전: `1.1.11`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.11-tech-perf-compat`
- 문서 정책: `README.md` 단일 문서 유지

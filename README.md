# AquaFantasia v1.1.10 Village Flow Swipe Polish

모바일 웹 낚시 게임 AquaFantasia의 v1.1.10 마을 화면 / 메뉴 스와이프 / 낚시 캐릭터 배치 보강 패치입니다. v1.1.4 설치 Hotfix, v1.1.5~v1.1.9 화면 경계·하단바·터치 안정화 정책은 유지하면서, 실제 플레이 화면에서 요청된 마을 첫 화면 흐름과 메뉴 순서를 다시 정리했습니다.

## v1.1.10에서 반영한 부분

- 사용자가 제공한 마을 섬 배경 이미지를 `public/assets/v1110/home/village_islands_user_bg.webp`로 추가하고 마을 첫 화면 배경으로 연결
- 원본 PNG도 `public/assets/v1110/home/village_islands_user_bg.png`에 보관
- 마을 첫 화면 로고를 위아래 높이는 늘리지 않고 좌우 폭을 더 꽉 채우도록 보정
- 마을 첫 화면 구성을 `로고 → 오늘의 조류 → 수역 선택` 순서로 재배치
- 수역 선택은 기존 8개 제한을 제거하고 모든 수역을 렌더링
- 수역 목록이 길어질 때 내부에서 잘리지 않고 화면을 세로 드래그해 내려볼 수 있도록 마을 화면 스크롤 흐름 수정
- 하단 메뉴 순서를 `마을 → 장비 → 가방 → 도감 → 상점 → 미션 → 랭킹 → 낚시`로 재정렬
- 좌우 스와이프 메뉴 이동 순서도 하단 메뉴와 동일하게 재정렬
- 낚시 화면은 계속 스와이프 이동 비활성화 유지
- 메뉴 카드/버튼 위에서 좌우 드래그해도 한 칸씩 메뉴 이동이 되도록 스와이프 시작 차단 조건 완화
- PixiJS 낚시 캐릭터를 더 작게 만들고 우측 끝에 자연스럽게 붙도록 배치 재계산
- WebGL 미지원 fallback 낚시 캐릭터도 우측 정렬/소형화
- SVG/벡터 자산 추가 없음
- PNG/WebP 기반 2.5D/3D 렌더링 방향 유지

## 유지된 안전 정책

- v1.1.4 Pixel Perfect Polish 유지
- v1.1.4 `@protobufjs/*` 설치 Hotfix 유지
- v1.1.5 UI Layout Rescue 유지
- v1.1.6 UI Bounds Polish 유지
- v1.1.7 Viewport Safe Lock 유지
- v1.1.8 Layout QA Sweep 유지
- v1.1.9 Interaction QA Polish 유지
- 하단 8칸 메뉴바 fixed 경계 보정 유지
- 각 메뉴 화면의 가로 이탈 방지 유지
- 낚시 화면 HUD / 최근 포획 / 릴 패널 / 결과 카드 하단 겹침 방지 유지
- PWA offline fallback은 HTML navigation 요청에만 적용

## 설치

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## GitHub Pages / Firebase 배포

```bash
npm run build
```

생성된 `dist/`를 Pages 또는 Firebase Hosting에 배포합니다.

## 버전

- 앱 버전: `1.1.10`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.10-village-flow-swipe-polish`
- 문서 정책: `README.md` 단일 문서 유지

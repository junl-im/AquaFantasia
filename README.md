# AquaFantasia v8.8.0

## 이번 패치 목적

v8.8.0은 `브라우저 전체화면 / 카카오 회전 방지 / 메뉴 UI 밀림 / 랭킹 배경 / 아이콘 오배치 / 캐릭터 선명도`를 다시 정리한 안정화 패치입니다.

## 핵심 변경

- 일반 브라우저는 사용자 터치 이후 `requestFullscreen({ navigationUI: 'hide' })`를 시도합니다.
- 카카오/인앱 브라우저는 회전 버그를 막기 위해 Fullscreen API를 호출하지 않고 CSS 몰입형 세로 화면만 사용합니다.
- Screen Orientation Lock API는 계속 사용하지 않습니다.
- 마을 / 장비 / 가방 / 도감 / 상점 / 미션 / 랭킹은 v13 통짜 구성도 의존을 줄이고 실제 DOM 런타임 UI로 재구성했습니다.
- 상단 주소창/인앱 브라우저 오프셋을 `visualViewport.offsetTop` 기반으로 반영해 상단 HUD 짤림을 줄였습니다.
- 우측 상단 버튼 가림 레이어를 런타임 UI에서는 사용하지 않습니다.
- 마을 하단 탭 아이콘을 가방 아이콘이 아닌 `v88/icons/village.png`로 교체했습니다.
- 가방/상점 화면의 옆 밀림 문제를 실제 grid/card 레이아웃으로 교체해 보정했습니다.
- 오늘의 조류 확인 버튼을 실제 버튼형 UI로 재구성했습니다.
- 랭킹 화면은 가짜 데이터 없이 현재 저장 기록의 `나`만 보여주며, 배경은 수중/심해 배경으로 복구했습니다.
- 캐릭터와 주요 아이콘을 `v88` 보정 에셋으로 재연결했습니다.
- 패치 문서는 이 README 하나만 유지합니다.

## PlayCanvas / WebGL / WebGPU 방향

전체 엔진을 즉시 교체하기보다, 현재 PixiJS 8 낚시 런타임은 유지하고 `배경 전용 3D 레이어`를 별도 브랜치로 실험하는 방향이 안전합니다.

1. 현재 안정 브랜치: PixiJS 8 + DOM UI + 고화질 PNG/WebP
2. 실험 브랜치: PlayCanvas/WebGL/WebGPU 수중 배경 레이어
3. 합류 조건: 모바일 FPS, 메모리, 카카오/인앱 브라우저 세로 고정 검증 통과

## 적용 방법

기존 프로젝트 루트에 ZIP 내용을 덮어쓴 뒤 다음을 실행합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 문서 정책

앞으로 `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES` 파일은 만들지 않고 README.md 하나를 계속 갱신합니다.

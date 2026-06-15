# AquaFantasia v8.7.0

세로 전용 2.5D 모바일 웹 낚시게임 패치 프로젝트입니다. 이 패치부터 문서는 `README.md` 하나로만 유지합니다. `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES` 파일은 더 이상 생성하지 않습니다.

## v8.7.0 핵심 변경

- 카카오/인앱 브라우저에서 `requestFullscreen()`과 `screen.orientation.lock()` 호출을 계속 금지합니다.
- 설치형 PWA에서는 `manifest.webmanifest`의 `display: fullscreen`으로 시스템 메시지 없는 전체화면 표시를 시도합니다.
- 일반/카카오 브라우저에서는 브라우저 전체화면 API 대신 `100dvh` 기반 몰입형 세로 화면으로 고정합니다.
- 뒤로가기 후 `종료` 선택 시 현재 브라우저 닫기를 즉시 시도합니다.
  - 일반 브라우저: `window.close()` / `history.back()` 순서로 처리
  - 카카오 인앱: Android `kakaotalk://inappbrowser/close`, iOS `kakaoweb://closeBrowser` 스킴을 직접 클릭 흐름 안에서 시도
  - 브라우저 정책으로 차단되면 안내 패널을 표시
- 랭킹 화면에 수중 배경을 복구하고, 가짜 유저 데이터 없이 현재 저장 기록의 `나`만 표시합니다.
- 캐릭터를 `public/assets/v87/characters/fisher_boat_crisp.png`로 교체했습니다.
- 하단 네비/탭/최근 포획/릴 패널을 v87 HD PNG 에셋으로 재구성했습니다.
- 최근 포획 패널은 실제 표시 비율에 맞춘 새 패널을 사용해 테두리 넘침을 줄였습니다.
- 아이콘은 v87 PNG로 다시 샤픈/색보정 후 연결했습니다.

## 적용 방법

1. ZIP을 기존 GitHub 프로젝트 루트에 덮어씁니다.
2. 한 번만 기존 누적 문서 파일을 삭제합니다.

```bash
rm -f CLEAN_REPLACE_GUIDE_v*.md FINAL_CONSOLIDATED_v*_통파일.md PATCH_NOTES_v*.md PROMPTS_DALLE_ASSETS_v*.md DELETE_OLD_FILES_v*.txt
rm -rf reports
```

3. 검증합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

## 현재 구조

- Vite / TypeScript
- PixiJS 8 낚시 런타임
- Howler.js 오디오
- Firebase Spark 기준 저장/서버 연동 준비
- GitHub Pages / GitHub Actions 배포 구조
- PWA manifest + Service Worker

## 주의

브라우저 탭 닫기와 일반 브라우저 UI 숨김은 브라우저/인앱 정책 영향을 받습니다. v8.7.0은 사용자의 직접 `종료` 터치 시점에 가능한 모든 닫기 경로를 시도하고, 설치형 PWA는 manifest fullscreen으로 풀화면을 시도합니다.

# AquaFantasia v8.6.0

세로 전용 2.5D 모바일 낚시 웹게임 프로젝트입니다. 이번 버전부터 패치 설명, 적용 방법, 검증 결과는 이 `README.md` 하나에 통합합니다. `CLEAN_REPLACE_GUIDE_*`, `FINAL_CONSOLIDATED_*`, `PATCH_NOTES_*` 같은 누적 MD 파일은 더 만들지 않습니다.

## 이번 패치 핵심

- 카카오톡/카카오 브라우저에서 `requestFullscreen()` 호출을 완전히 중단했습니다.
- `screen.orientation.lock()` 호출도 중단했습니다.
- 전체화면 시스템 메시지가 뜨면서 화면이 돌아가는 문제를 막기 위해, 세로 고정은 CSS viewport cage 방식만 사용합니다.
- 기존 세로 전용 정책은 유지합니다. 물리적으로 가로가 되더라도 게임 UI는 세로 셸 안에서만 렌더링됩니다.
- 마을/메뉴 화면에서 v13 구성도에 이미 구워진 하단 메뉴와 실제 메뉴가 겹치던 문제를 가림 레이어로 정리했습니다.
- 실제 하단 탭 네비게이션은 8탭 기준으로 다시 맞췄습니다.
- 하단 메뉴 배경을 v86 전용 정리 프레임으로 교체했습니다.
- 최근 포획 패널과 릴 패널의 모서리/테두리 넘침을 줄이도록 전용 정리 프레임을 적용했습니다.
- 버튼형 UI 색감은 과한 보라/금색 느낌을 줄이고 물빛 2.5D 톤으로 맞췄습니다.
- 문서 누적 문제를 막기 위해 루트 MD는 `README.md`만 유지합니다.

## 적용 방법

기존 프로젝트 루트에 패치 ZIP 내용을 덮어씁니다. 이전에 생성된 아래 파일들은 한 번 정리해 주세요.

```bash
rm -f CLEAN_REPLACE_GUIDE_v*.md FINAL_CONSOLIDATED_v*_통파일.md PATCH_NOTES_v*.md PROMPTS_DALLE_ASSETS_v*.md DELETE_OLD_FILES_v*.txt
rm -rf reports
```

그 뒤 검증합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

## 주의

GitHub Desktop에서 단순 덮어쓰기만 하면 기존 루트에 남아 있던 예전 MD 파일은 자동 삭제되지 않을 수 있습니다. 이번 ZIP 자체에는 누적 MD를 넣지 않았지만, 로컬 저장소에 이미 남아 있는 파일은 위 삭제 명령으로 한 번 정리해야 완전히 깨끗해집니다.

## 현재 구조

- Vite / TypeScript
- PixiJS 8 낚시 런타임
- Howler.js 오디오
- Firebase Spark 기준 저장/익명 연동 준비 구조
- PWA manifest + service worker
- GitHub Pages / GitHub Actions 배포 구조

## 검증 기준

`npm run validate`는 다음을 확인합니다.

- v8.6.0 버전/캐시명 일치
- fullscreen API 미사용
- orientation lock API 미사용
- 카카오/인앱 브라우저 CSS 세로 고정 정책 유지
- v86 하단 네비/최근 포획/릴 패널 정리 에셋 존재
- 누적 패치 MD 파일 미포함


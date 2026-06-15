# AquaFantasia v9.0.0

모바일 세로 고정 낚시 웹게임입니다. 이번 패치는 v8.9.0 위에 **WebGL 수중 배경 전용 레이어**와 **귀여운 치비 낚시 캐릭터 톤**을 안전하게 얹는 안정화 패치입니다.

## 이번 패치 핵심

- GitHub Actions `validate` 실패 원인 수정
  - 기존 repo에 남아 있던 `reports/`, `CLEAN_REPLACE_GUIDE_*`, `FINAL_CONSOLIDATED_*`, `PATCH_NOTES_*` 파일 때문에 실패하던 문제를 자동 정리합니다.
  - `npm run validate`가 먼저 `tools/clean-old-patch-docs.mjs`를 실행합니다.
- 문서 정책 유지
  - 패치 ZIP 안의 문서는 `README.md` 하나만 유지합니다.
  - 새 `PATCH_NOTES`, `FINAL_CONSOLIDATED`, `reports` 파일을 만들지 않습니다.
- 3D 수중 배경 전용 레이어 추가
  - 기존 PixiJS 낚시 플레이와 DOM UI는 유지합니다.
  - 메뉴/낚시 화면의 배경에 `UnderwaterWebglLayer` 캔버스를 붙여 WebGL shader 기반 수중 파동, 광선, 카스틱, 심도감을 추가합니다.
  - WebGL 미지원 기기에서는 기존 CSS/이미지 배경으로 자동 fallback됩니다.
- 캐릭터 톤 개선
  - 낚시터 플레이어 캐릭터를 `public/assets/v90/characters/fisher_boat_cute_crisp.png`로 연결했습니다.
  - 첨부한 귀여운 치비 낚시 소녀 레퍼런스 톤은 `chibi_boat_tone_reference.webp`로 보관해 이후 캐릭터 확장 기준으로 삼습니다.
- 캐시 갱신
  - Service Worker 캐시 이름을 `aqua-fantasia-v9.0.0-webgl-underwater-cute-runtime`으로 변경했습니다.

## 적용 방법

기존 프로젝트 루트에 ZIP을 덮어쓴 뒤 아래 명령으로 확인합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 카카오/인앱 브라우저 방침

- 카카오/인앱 브라우저에서는 `requestFullscreen()`과 `screen.orientation.lock()`을 호출하지 않습니다.
- 회전 버그 방지를 위해 CSS 세로 고정/viewport cage만 사용합니다.
- 일반 브라우저/PWA에서는 기존 정책에 따라 가능한 경우에만 몰입형 표시를 시도합니다.

## 다음 우선순위

1. PlayCanvas/WebGPU 브랜치 분리 실험
   - 지금은 WebGL shader 배경 레이어만 적용했습니다.
   - 다음 단계에서 PlayCanvas를 선택적으로 import하는 `3D 배경 전용 브랜치`를 만들면 됩니다.
2. 캐릭터 확장
   - 현재는 기존 투명 치비 보트 캐릭터를 선명하게 보정했습니다.
   - 다음 단계에서 사용자 레퍼런스처럼 큰 눈, 밝은 금발/리본/아기자기한 표정의 원화급 캐릭터 세트를 별도 제작/교체하는 흐름이 좋습니다.
3. UI 파츠 9-slice 정리
   - 하단 탭/패널/버튼을 완전한 런타임 파츠로 더 분해해 화면별 밀림과 흐림을 계속 줄입니다.

# AquaFantasia v4.9 Action Mobile Clean Bundle Notes

이 번들은 업로드된 누적 v5.4 상태를 실제 기준으로 분석하고, v4.9 요청 범위에 맞춰 모바일 낚시 조작감과 캐시 안정성을 오버레이로 보강한 덮어쓰기용 패치입니다.

## 핵심 변경 파일

- `index.html` - v4.9 액션 모바일 런타임 로드, 메타/타이틀 표기 변경
- `sw.js` - 캐시 버전 갱신, 신규 런타임 precache, 캐시 클리어 메시지 추가
- `manifest.webmanifest` - v4.9 Action Mobile Patch 표기
- `src/runtime/v49-action-mobile-patch.js` - 모바일 액션 낚시/성능/UI 보강 런타임
- `tools/check-v49-action-mobile.mjs` - GitHub Actions용 검증 추가
- `AquaFantasia_v4.9_standalone_phaser.html` - DALL-E 에셋 플레이스홀더 기반 단일 Phaser 프로토타입

## 배포 방식

ZIP을 기존 GitHub Pages 프로젝트 루트에 덮어쓴 뒤 GitHub Desktop에서 커밋/푸시하면 기존 Actions 검증 경로가 유지됩니다.

## 주의

현재 프로젝트는 `index.html` 단일 통파일과 `src/runtime` 오버레이가 함께 동작하는 전환기 구조입니다. Vite/TypeScript/PixiJS/Howler/Firebase 모듈은 이미 스캐폴드가 존재하므로, 다음 단계에서는 `src/main.ts` 빌드 결과를 실제 index 엔트리로 점진 전환하는 것을 권장합니다.

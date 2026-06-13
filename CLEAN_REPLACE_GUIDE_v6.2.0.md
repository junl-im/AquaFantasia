# Aqua Fantasia v6.2.0 Clean Replace Guide

이번 버전은 누적 패치가 아니라 클린 교체본입니다.

## 권장 적용 방식

1. GitHub Desktop에서 저장소 폴더를 엽니다.
2. `.git` 폴더만 남기고 기존 파일을 삭제합니다.
3. `AquaFantasia_v6.2.0_ASSET_RUNTIME_REBOOT_FULL_PROJECT.zip` 내용을 저장소 루트에 압축 해제합니다.
4. GitHub Desktop에서 커밋/푸시합니다.
5. GitHub Actions가 `validate-and-deploy` 1개만 실행되는지 확인합니다.
6. 모바일에서 기존 PWA 아이콘은 삭제 후 다시 설치합니다.

## 삭제해야 하는 기존 잔여물

- `AquaFantasia_v*.html`
- `PATCH_NOTES_v*.md`
- `V*_CHECKLIST*.md`
- `reports/`
- 오래된 `src/runtime/`
- `.github/workflows/aqua-static-validate.yml`

## v6.2.0 목표

- 첫 화면에는 로그인 UI만 표시
- 낚시 HUD, 상점 FAB, 버전 배지, 패치 내역 문구 제거
- Vite / TypeScript / PixiJS 8 / Howler.js / Firebase 익명 서버연동 구조 반영
- WebP Atlas 및 이미지 기반 낚시 핵심 에셋 포함
- GitHub Actions 검증 및 Pages 배포 유지

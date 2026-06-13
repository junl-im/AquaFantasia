# Aqua Fantasia v6.1.0 Clean Replace Guide

현재 사용자 ZIP 분석 결과, 기존 프로젝트에는 다음 문제가 누적되어 있었습니다.

1. `.git` 폴더가 ZIP에 포함되어 있었습니다.
2. `AquaFantasia_v4.9_CLEAN_UNIFIED.html`부터 `AquaFantasia_v5.9.0_CLEAN_UNIFIED.html`까지 오래된 통파일 HTML이 루트에 다수 남아 있었습니다.
3. `PATCH_NOTES_*`, `V*_CHECKLIST_*`, `reports/*`가 루트에 누적되어 배포 파일과 개발 문서가 섞였습니다.
4. `index.html` 안에 v5.1 문구, 낚시 HUD, 상점 플로팅 버튼, 버전 배지, 여러 세대 런타임 스크립트가 동시에 남아 있었습니다.
5. 일부 에셋 파일명에 깨진 유니코드명이 섞여 압축 해제 시 경고가 발생했습니다.

## 교체 방법

가장 안전한 방법은 GitHub Desktop에서 현재 저장소를 연 뒤 다음 순서로 진행하는 것입니다.

1. 저장소 루트에서 `.git` 폴더만 남깁니다.
2. 기존 `index.html`, `sw.js`, `manifest.webmanifest`, `assets`, `src`, `reports`, `docs`, 오래된 `AquaFantasia_v*.html`, `PATCH_NOTES_*`, `V*_CHECKLIST_*` 파일을 삭제합니다.
3. `AquaFantasia_v6.1.0_CLEAN_REPLACE_FULL_PROJECT.zip` 내용을 저장소 루트에 풉니다.
4. GitHub Desktop에서 변경사항을 확인하고 커밋/푸시합니다.
5. 모바일 브라우저에서 이전 PWA가 남아 있으면 홈 화면 아이콘을 삭제 후 다시 설치하거나, 브라우저 사이트 데이터를 한 번 지우면 가장 확실합니다.

## 포함 파일

- index.html
- manifest.webmanifest
- sw.js
- offline.html
- assets/art/*
- assets/icons/*
- package.json / package-lock.json
- tools/validate-clean.mjs
- .github/workflows/pages.yml
- README.md

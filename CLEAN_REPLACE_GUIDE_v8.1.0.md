# AquaFantasia v8.1.0 덮어쓰기 가이드

## 적용 방법

1. 기존 GitHub Desktop 프로젝트 폴더를 연다.
2. `AquaFantasia_v8_1_0_ASSET_FIT_START_KEEP_OVERWRITE_PATCH.zip`의 내용을 프로젝트 루트에 그대로 덮어쓴다.
3. 터미널에서 아래 명령을 실행한다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

4. GitHub Desktop에서 변경 파일을 확인하고 commit/push 한다.
5. GitHub Actions / GitHub Pages 배포 결과를 확인한다.

## 핵심 확인 포인트

- 시작 화면에서 `익명 서버연동` 아래에 `이 기기에서 로그인 유지` 버튼이 보여야 한다.
- 로그인 유지 버튼은 눌렀을 때 체크 상태가 보이는 실제 버튼이어야 한다.
- 장비 / 상점 / 미션 화면이 하단 네비게이션에 가려지지 않아야 한다.
- 글씨가 이미지 글씨와 겹치지 않아야 한다.
- 전체 톤은 SVG/벡터 느낌이 아니라 렌더드 PNG/WebP 느낌이어야 한다.

## 포함하지 않는 항목

패치 ZIP에는 `node_modules`와 `dist`를 포함하지 않는다. 배포 빌드는 GitHub Actions 또는 로컬 `npm run build`가 다시 생성한다.

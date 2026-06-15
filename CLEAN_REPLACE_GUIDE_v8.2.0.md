# AquaFantasia v8.2.0 덮어쓰기 적용 가이드

## 적용 방법

1. 기존 GitHub 프로젝트 루트에 ZIP 내용을 그대로 덮어씁니다.
2. GitHub Desktop에서 변경 파일을 확인합니다.
3. 아래 명령으로 로컬 검증을 실행합니다.

```bash
npm install
npm run typecheck
npm run validate
npm run build
```

4. 문제가 없으면 commit / push 합니다.
5. GitHub Actions가 Pages 배포를 진행합니다.

## 중요

- `node_modules`는 ZIP에 포함하지 않았습니다.
- `dist`는 GitHub Actions에서 다시 생성하는 구조를 유지합니다.
- v13 구성도 원본은 런타임 WebP로 변환되어 `public/assets/v13/compositions`에 들어갔습니다.
- v13 레이아웃 원본 스펙은 `public/assets/v13/reference`에 보관했습니다.

## 변경된 런타임 구조

- 앱 버전: `8.2.0`
- 캐시 이름: `aqua-fantasia-v8.2.0-v13-tab-composition`
- 검증 스크립트: `tools/check-v820-v13-tab-composition.mjs`
- 하단 탭: 8개
- 신규 화면 타입: `inventory`, `ranking`

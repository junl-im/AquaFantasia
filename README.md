# AquaFantasia v4.9 Action Mobile Patch

모바일 웹 낚시 게임 **Aqua Fantasia**의 GitHub Pages / Firebase Spark / PWA 기준 덮어쓰기 패치입니다.

업로드된 ZIP은 설명상 v4.8 통파일이었지만 실제 파일에는 v4.9~v5.4 누적 런타임과 문서가 포함되어 있었습니다. 이번 패치는 기존 v5.4 검증 스크립트를 깨지 않도록 유지하면서, 요청 우선순위인 v4.9 모바일 액션 낚시와 성능·UI·PWA 캐시 안정성을 오버레이 방식으로 보강합니다.

## 핵심 실행 파일

- `index.html` - GitHub Pages용 메인 통파일
- `sw.js` - PWA Service Worker
- `manifest.webmanifest` - PWA 매니페스트
- `src/runtime/v49-action-mobile-patch.js` - v4.9 모바일 액션 런타임 패치
- `AquaFantasia_v4.9_CLEAN_UNIFIED.html` - 정리된 통파일 사본
- `AquaFantasia_v4.9_standalone_phaser.html` - Phaser.js 단일 HTML 프로토타입

## 검증

```bash
npm run validate
npm run audit
npm run runtime:check
npm run runtime49:action
```

GitHub Actions는 기존 `.github/workflows/pages.yml` 경로를 유지합니다.

## 배포

1. ZIP 내용을 기존 프로젝트 루트에 덮어씁니다.
2. GitHub Desktop에서 변경 파일을 확인합니다.
3. 커밋 후 `main` 브랜치에 푸시합니다.
4. GitHub Pages Actions가 자동으로 정적 검증 후 배포합니다.

## v4.9 패치 포인트

- CAST 버튼 squash/stretch 체감 보강
- 찌 포물선/둥실/입질 말풍선/터치 링 런타임 오버레이
- 릴 단계 “꾹 눌러 릴 감기” 모바일 조작 연결
- 낚시 화면 UI 겹침 제거
- 저사양/Save-Data/Reduce Motion 자동 라이트 모드
- Service Worker 캐시 버전 갱신 및 캐시 클리어 메시지 지원

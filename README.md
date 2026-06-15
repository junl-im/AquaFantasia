# AquaFantasia v9.1.0

모바일 세로 전용 낚시 웹게임입니다. 이번 버전은 v9.0.0의 WebGL 수중 레이어 기준선을 유지하면서, 화면 품질을 다시 끌어올리는 비주얼 폴리싱 패치입니다.

## v9.1.0 핵심 변경

- GitHub Actions `validate` 실패 방지 정책 유지
  - 오래된 `reports/`, `CLEAN_REPLACE_GUIDE_*`, `FINAL_CONSOLIDATED_*`, `PATCH_NOTES_*` 문서는 자동 정리합니다.
  - 프로젝트 문서는 `README.md` 하나만 유지합니다.
- 캐릭터 톤을 귀엽고 선명한 치비 낚시 소녀 방향으로 교체했습니다.
  - `public/assets/v91/characters/chibi_fisher_boat_story.png`
- v91 전용 배경을 추가했습니다.
  - 마을/장비/가방/도감/상점/미션/랭킹 메뉴 배경을 귀여운 바다 톤으로 재정렬했습니다.
  - 낚시 수역 배경도 v91 경로로 연결했습니다.
- 기존 PixiJS 낚시 런타임과 DOM UI는 유지합니다.
- WebGL 수중 레이어는 계속 유지하되, 낚시 화면에서도 실제로 보이도록 overlay 계층을 조정했습니다.
- UI 패널/버튼/하단 네비를 v91 렌더드 2.5D 에셋으로 재정렬했습니다.
- 하단 메뉴 아이콘을 2.5D 렌더드 아이콘으로 교체했습니다.
- 카카오/인앱 브라우저 세로 고정 정책은 유지합니다.

## 실행

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 배포

GitHub Pages 기준 Vite 정적 빌드 구조입니다. ZIP을 프로젝트 루트에 덮어쓴 뒤 GitHub Desktop에서 commit/push 하면 GitHub Actions가 검증 후 배포합니다.

## 문서 정책

이번 버전부터 패치 문서는 `README.md` 하나에만 통합합니다. 이전 버전의 별도 MD 문서가 남아 있으면 `npm run validate`에서 자동 정리합니다.

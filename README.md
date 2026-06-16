# AquaFantasia v9.7.0

모바일 웹/PWA 낚시 게임 **AquaFantasia**의 v9.7.0 패치입니다.

## 이번 패치 목표

v9.6.0에서 지적된 하단 메뉴바 프레임 문제와 낚시 화면 가시성 문제를 우선 수정했습니다.

- 하단 메뉴바 테두리가 버튼보다 작아 보이던 문제 개선
- 하단 전체를 감싸는 큰 PNG 프레임으로 메뉴바 재구성
- 선택된 메뉴 표시는 큰 테두리 대신 부드러운 금빛 셀 + 작은 진주 점으로 변경
- 낚시터 캐릭터가 UI에 묻혀 잘 안 보이던 문제 개선
- PixiJS 캐릭터 스케일/위치 재조정
- 낚시 게이지바를 더 크고 선명하게 재구성
- 안전 구간/장력 fill 대비 강화
- 최근 포획 / 낚시 시작 / 릴 패널이 서로 과하게 겹치지 않도록 하단 간격 재조정
- 배경은 기존 WebGL 수중 레이어 유지하면서 가독성 레이어 보정
- `README.md` 단일 문서 정책 유지

## 유지되는 방향성

- 세로 고정 유지
- 기존 PixiJS 낚시 런타임 유지
- 기존 DOM UI 유지
- WebGL 수중 배경 레이어 유지
- 귀여운 치비/2.5D 낚시 게임 톤 유지
- 카카오/인앱 브라우저에서는 회전 버그 방지를 위해 Screen Orientation Lock API를 사용하지 않음

## 검증 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 배포

GitHub Desktop으로 덮어쓰기 후 commit/push하면 GitHub Actions가 빌드 및 Pages 배포를 진행합니다.

## 문서 정책

패치별 `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES`, `reports` 파일은 더 이상 생성하지 않습니다. 변경 사항은 이 `README.md` 하나에 계속 통합합니다.

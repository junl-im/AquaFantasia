# AquaFantasia v1.0.4 UI Refinement Polish

세로 전용 모바일 웹 낚시 게임 **AquaFantasia**의 v1.0.4 덮어쓰기용 패치입니다. 이번 패치는 새 기능보다 UI 안정감과 읽기 편함을 더 다듬는 정리 패치입니다.

## 이번 패치 핵심

- 상점 / 미션 / 랭킹 / 장비 / 가방 / 도감 카드의 텍스트 넘침 방지 강화
- 긴 글자, 가격, 점수, 진행 버튼이 프레임 밖으로 나가지 않도록 카드별 안전 레인 재정리
- 버튼 크기를 더 아담하게 조정하면서 렌더드 버튼 질감 유지
- 버튼 글씨 색상과 그림자 톤을 수중 UI에 맞게 재조정
- 하단 메뉴바 전체 프레임은 유지하되, 선택 표시를 더 차분하게 다듬음
- 마을 상단 HUD/로고 영역을 더 깔끔한 캡슐 프레임으로 정리
- 낚시 화면의 콤보 / 낚시 시작 / 최근 포획 / 릴 패널 레인을 다시 분리
- WebGL 수중 배경 레이어, PixiJS 낚시 런타임, 귀여운 치비 톤 유지
- 문서는 `README.md` 하나만 유지

## 적용 방법

기존 GitHub 프로젝트 루트에 ZIP 내용을 그대로 덮어쓴 뒤 실행하세요.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 문서 정책

패치별 MD 파일은 더 이상 만들지 않습니다. 변경 내용과 적용 가이드는 이 `README.md` 하나에 계속 통합합니다.

## 배포 구조

- GitHub Desktop으로 commit/push
- GitHub Actions에서 validate/typecheck/build/audit 수행
- GitHub Pages로 배포
- Firebase Spark 플랜 기준 구조 유지
- PWA/Service Worker 캐시는 v1.0.4 기준으로 갱신

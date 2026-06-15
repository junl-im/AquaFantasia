# AquaFantasia v9.4.0 UI Scale + Nav Polish

이번 패치는 v9.3.0의 귀여운 액션 낚시 연출과 WebGL 수중 배경 레이어는 유지하면서, 화면에서 어색하게 커 보이던 UI 크기와 하단 메뉴 선택 효과를 정리한 폴리싱 패치입니다.

## 핵심 변경

- 하단 메뉴 선택 상태가 칸 밖으로 튀거나 테두리가 과하게 커 보이던 문제 수정
- 선택된 메뉴는 각 탭 셀 내부에 들어오는 얇은 2px 인셋 프레임으로 변경
- 하단 네비 높이/아이콘/글자 크기 균형 재조정
- 작은 모바일 화면에서 8개 메뉴가 눌리지 않거나 글씨가 밀리는 문제 완화
- 마을/장비/가방/도감/상점/미션/랭킹 기본 카드 크기와 패널 padding 정리
- 낚시 HUD, 최근 포획, 낚시 시작 버튼, 릴 패널 크기 재정렬
- 포획 결과 팝업이 작은 화면에서 과하게 커지는 문제 완화
- WebGL 수중 배경, PixiJS 낚시 런타임, 귀여운 치비 액션 연출은 유지
- 문서는 계속 README.md 하나만 유지

## 검증

```bash
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 적용

이 ZIP은 덮어쓰기용 소스 패치입니다. 기존 프로젝트 루트에 덮어쓴 뒤 GitHub Desktop에서 commit/push 하면 GitHub Actions가 다시 검증/배포합니다.

기존 저장소에 과거 패치 문서가 남아 있으면 `npm run validate`에서 자동 정리합니다.

# AquaFantasia v1.0.2

모바일 웹 낚시 게임 AquaFantasia의 현재 패치입니다. 버전 체계는 `1.0.1 → 1.0.2 → ... → 1.1.0` 방식으로 유지합니다.

## v1.0.2 핵심 변경

- 하단 메뉴바 프레임 양끝 흰점/구슬 느낌 제거
- 하단 메뉴바를 `v102` 전용 무점 프레임 PNG로 교체
- 버튼형 UI 색감과 글씨색을 수중 톤에 맞게 재정리
- 버튼 크기를 아담하게 줄이되 렌더드 질감 유지
- 투명 프레임 뒤가 뚫려 보이지 않도록 모든 주요 패널에 100% 배경 fill 적용
- 상점 / 미션 / 랭킹 / 도감 / 가방 / 장비 카드의 텍스트 overflow 방지
- 긴 글은 1~2줄 안에서 ellipsis 처리
- 상점 가격, 미션 보상 버튼, 랭킹 점수 영역이 프레임 밖으로 나가지 않도록 grid 재조정
- 낚시터 콤보 / 낚시 시작 / 최근 포획 / 릴 게이지 간격 재정리
- 기존 PixiJS 낚시 런타임과 WebGL 수중 레이어 유지
- 프로젝트 문서는 계속 `README.md` 하나만 유지

## 검증

```bash
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 문서 정책

`CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES`, `reports/`는 더 이상 생성하지 않습니다. 필요한 변경 기록은 이 `README.md`에 통합합니다.

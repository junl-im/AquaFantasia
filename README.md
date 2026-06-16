# AquaFantasia v1.0.3 UI Cleanup Polish

세로 전용 모바일 웹 낚시 게임 **AquaFantasia**의 v1.0.3 덮어쓰기용 패치입니다.

## 이번 패치 핵심

- 버전 체계는 `1.0.x` 유지
- 하단 메뉴바는 v1.0.2의 흰점 제거 프레임을 유지하면서 더 슬림하게 조정
- 카드/패널/버튼의 투명 프레임 뒤가 비어 보이지 않도록 내부 fill 레이어 강화
- 상점 / 미션 / 랭킹 / 장비 / 가방 / 도감에서 텍스트와 숫자가 프레임 밖으로 나가지 않도록 containment 보강
- 버튼은 v3d 렌더드 버튼 이미지를 다시 사용해, 크기는 아담하지만 질감은 유지
- 낚시터 콤보 / 낚시 시작 / 최근 포획 / 릴 패널이 서로 겹치지 않도록 레이어별 위치 재정리
- 기존 PixiJS 낚시 런타임, WebGL 수중 레이어, Firebase Spark 기준 구조 유지
- 문서는 `README.md` 하나만 유지

## 적용 방법

기존 GitHub 프로젝트 루트에 ZIP 내용을 그대로 덮어쓴 뒤 다음 명령으로 확인합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 문서 정책

이제 패치마다 `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES` 파일을 추가 생성하지 않습니다. 변경 내용은 이 `README.md` 하나에 통합해 계속 덮어씁니다.

## 주의

기존 저장소에 과거 문서 파일이나 `reports/` 폴더가 남아 있어도 `npm run validate` 시 `tools/clean-old-patch-docs.mjs`가 먼저 정리합니다.

# AquaFantasia v2.1.55

## v2.1.55 변경사항

- 우측 상단 메뉴바를 22px급 마이크로 아이콘 셀로 더 줄이고, 버튼 간격을 넓혀 붙어 보이는 문제를 완화했습니다.
- 뒤쪽 큰 테이블/배경 프레임은 계속 제거하고, 아이콘 주변의 얇은 반투명 1중 테두리만 유지합니다.
- 낚시 릴링 실전 화면에서 포획/텐션/저항 게이지를 감기/풀기 버튼 바로 위에 고정했습니다.
- 릴링 중 구형 릴 패널과 준비 UI를 숨겨 실전 게이지와 감기/풀기 버튼이 가려지지 않도록 정리했습니다.
- 하단 메뉴 아이콘 클리핑과 공통 페이지 카드 안정화 정책은 유지합니다.
- 타일 픽셀 크기는 유지합니다. v2.1.55는 다이아몬드 터치 점수만 `0.932`로 소폭 조정하며, 타일 픽셀 축소는 세이브 좌표, 건물 footprint, NPC 이동, 충돌 판정, 카메라 경계 마이그레이션 전까지 보류합니다.
- 루트 버전 파일 `APP_VERSION`은 만들지 않습니다. 버전 기록은 README와 코드 상수로만 관리합니다.

## 검증

- `npm run validate`
- full ZIP / patch ZIP 무결성 확인
- full ZIP 새 압축 해제 후 validate
- 이전 full ZIP에 patch ZIP 덮어쓰기 후 validate

## 배포 메모

- `node_modules`, `dist`, `reports`, `backup`, `logs`, `_NOTES`, `APP_VERSION`은 배포 ZIP에 포함하지 않습니다.
- GitHub Actions에서는 `npm ci` 후 생성되는 `node_modules`가 있어도 validate가 실패하지 않아야 합니다.

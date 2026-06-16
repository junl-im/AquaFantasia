# AquaFantasia v1.0.10 Small Detail Polish

모바일 웹 낚시 게임 AquaFantasia의 v1.0.10 덮어쓰기용 소스 패치입니다.

## 이번 패치 핵심

- 작은 UI 어색함을 줄이는 정리 패스
- 하단 메뉴바 프레임은 낮고 단정하게 유지
- 하단 메뉴 아이콘은 작아지지 않게 시인성 유지
- 선택된 메뉴 표시는 과한 테두리 대신 얇은 빛줄기만 유지
- 카드/패널 내부 글자와 버튼이 테두리 밖으로 나가지 않도록 containment 보강
- 상점 2열 카드의 아이콘, 가격 버튼, 태그 밀도 추가 정리
- 미션 카드 진행 게이지 높이와 내부 간격 정리
- 랭킹 한 줄 기록의 글자 대비와 줄임표 처리 보강
- 낚시 화면의 낚시 시작/최근 포획/릴 패널/콤보 위치를 다시 분리
- WebGL 수중 효과는 유지하되 UI를 가리지 않도록 알파/대비를 정리
- 문서는 README.md 하나만 유지

## 적용 방법

기존 프로젝트 루트에 ZIP 내용을 그대로 덮어쓴 뒤 아래 명령을 실행합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 유지 정책

- GitHub Pages + GitHub Actions 배포 구조 유지
- PWA 구조 유지
- Firebase 무료 Spark 플랜 친화 구조 유지
- PixiJS 낚시 런타임 유지
- WebGL 수중 배경 레이어 유지
- 세로 고정 정책 유지
- 낚시 화면은 좌우 스와이프 탭 이동 비활성화 유지
- 패치 문서는 README.md 하나로 계속 덮어쓰기

## 버전

- 현재 버전: 1.0.10
- 다음 예정: 1.1.0 또는 1.0.11

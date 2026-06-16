# AquaFantasia v9.8.0

모바일 웹 낚시 게임 `AquaFantasia`의 v9.8.0 패치입니다.

## 이번 패치 목표

- 색만 채워둔 듯한 가짜 테두리/작은 프레임 느낌 정리
- UI 프레임보다 글씨가 밖으로 나가는 문제 방지
- 하단 메뉴바를 하단 전체 프레임으로 다시 안정화
- WebGL 수중 레이어를 더 물속 게임 화면처럼 개선
- 기존 PixiJS 낚시 런타임과 DOM UI 유지
- 문서는 `README.md` 하나만 유지

## 주요 변경

### UI 프레임 정리

- 메뉴 패널/카드/버튼에 v3d underwater UI frame assets를 우선 연결했습니다.
- 작게 겹쳐 보이던 단색 테두리 느낌의 배경을 제거하거나 실제 프레임 PNG로 교체했습니다.
- 카드, 패널, 미션, 상점, 장비, 랭킹 카드에 `minmax(0, 1fr)`, `line-clamp`, `ellipsis`, `overflow-wrap`를 적용했습니다.
- 한국어 텍스트가 버튼과 패널 밖으로 밀리지 않도록 `word-break: keep-all`과 폭 제한을 보강했습니다.

### 하단 메뉴바

- 하단 메뉴는 작은 개별 테두리보다 전체 하단부를 감싸는 큰 프레임 중심으로 재정리했습니다.
- 선택 상태는 작은 진주점/빛줄기만 남겨 과한 칸 테두리 느낌을 줄였습니다.
- 390px 이하 작은 화면에서도 버튼/아이콘/글자가 프레임 안에 들어오도록 재조정했습니다.

### WebGL 수중 레이어

- `UnderwaterWebglLayer` 셰이더를 개선했습니다.
- 추가된 표현:
  - 수중 깊이 그라디언트
  - 다층 카스틱
  - 빛줄기 god ray
  - 버블 필드
  - 플랑크톤 입자감
  - 물고기 그림자
  - 심도 안개와 비네팅
- WebGL 미지원 기기에서는 기존 배경/fallback 구조를 유지합니다.

## 검증

```bash
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 배포 구조

- GitHub Desktop + GitHub Pages 구조 유지
- Firebase Spark 플랜 기준 유지
- PWA 구조 유지
- 회전 방지/세로 고정 정책 유지
- `dist`, `node_modules`는 ZIP에서 제외

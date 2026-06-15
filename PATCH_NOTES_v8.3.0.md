# PATCH NOTES v8.3.0 - UI Polish Audit Fix

## 목적

v8.2.0에서 v13 전체 UI 구성도를 적용했지만, 실제 모바일 기기에서는 비율 왜곡과 hotspot 좌표 어긋남 가능성이 남아 있었다. 이번 패치는 새 기능보다 UI 안정성을 먼저 다듬는 점검/수정 패치다.

## 발견한 문제

1. v13 1080x1920 구성도 이미지를 화면 전체에 직접 `fill`하는 구조라 9:16이 아닌 긴 스마트폰에서 UI가 늘어나 보일 수 있었다.
2. 보이는 이미지와 투명 hotspot이 같은 원본 좌표계를 쓰지 않아 일부 기기에서 터치 위치가 어긋날 수 있었다.
3. 시작 화면은 1024x1536 아트인데, 버튼 좌표가 화면 기준으로만 잡혀 있어 좌우 crop이 생기는 기기에서 로그인/서버연동/로그인 유지 위치가 불안정할 수 있었다.
4. 낚시 화면의 PixiJS stage와 릴 패널이 v13 구성도 위에 올라가지만, 부모 좌표계가 v13 원본 surface와 완전히 묶여 있지 않았다.
5. 가방 탭의 사용 CTA hotspot 높이가 작은 기기 기준 44px 아래로 내려갈 수 있었다.

## 수정 내용

- `start-design-surface` 추가: 시작 화면 아트와 버튼이 같은 1024x1536 좌표계를 사용하도록 수정
- `v13-design-surface` 추가: v13 탭 구성도와 hotspot이 같은 1080x1920 좌표계를 사용하도록 수정
- v13 하단 탭 transparent nav를 9:16 디자인 표면 폭 기준으로 정렬
- 낚시 화면 stage / stage-ui / reel panel / combo badge를 v13 surface 내부로 이동
- 가방 탭 CTA hotspot을 `[690, 1435, 310, 125]`로 확대
- `APP_VERSION`, `CACHE_NAME`, service worker cache를 v8.3.0으로 갱신
- `tools/check-v830-ui-polish.mjs` 추가

## 검증 결과

- `npm run validate` 통과
- `npm run typecheck` 통과
- `npm run build` 통과

## 남은 방향

v13 화면은 지금도 전체 구성도 이미지 + 투명 hotspot 방식이다. 화면 안정성 기준선으로는 좋지만, 장기적으로는 각 패널을 9-slice UI 파츠로 분리하고 실제 데이터 텍스트를 안전영역 안에 바인딩하는 방식으로 발전시켜야 한다.

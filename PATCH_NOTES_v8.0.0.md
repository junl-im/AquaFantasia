# PATCH NOTES v8.0.0

## 핵심 수정

1. 장비/상점/미션 화면 가시성 복구
   - 모든 비낚시 화면을 `scroll-screen` 기반 세로 카드형 UI로 재정렬
   - 하단 nav 높이만큼 padding/scroll-padding을 확보해 마지막 카드가 가려지지 않도록 수정

2. 렌더드 에셋 실반영
   - 사용자 제공 `낚시.zip`에서 Ocean/Lake/River/Stream/DeepSea/Town Waterfront 배경 WebP 재생성
   - 렌더드 물고기 29종을 투명 PNG로 추출해 기존 vector-like 물고기 대체
   - 낚싯대, 릴, 낚싯줄, 미끼, 찌, 코인, 장비/상점/nav 아이콘을 렌더드 PNG로 교체

3. 시작 화면 겹침 수정
   - `익명 서버연동` 버튼 hitbox를 화면 폭 기준으로 확대/재정렬
   - `이 기기에서 로그인 유지`는 중복 텍스트와 배경을 제거하고 체크 표시만 동작하도록 변경

4. 낚시 화면 액션감 기준 보정
   - PixiJS 플레이어 보트, 찌, catch fish 스케일을 새 렌더드 이미지 기준으로 재조정
   - 배경을 렌더드 WebP로 교체해 2.5D 느낌 강화

## 검증

- `npm run validate` 통과
- `npm run typecheck` 통과
- `npm run build` 통과

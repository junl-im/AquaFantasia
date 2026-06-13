# Aqua Fantasia v7.4.0 User Asset Pack Integration

## 핵심

업로드된 `낚시.zip`의 UI 프레임, 버튼, 배경, 물고기 시트를 기준 아트팩으로 반영했습니다.

## 변경사항

- 시작 화면 `start_screen_clean_v740` 추가
  - 로그인 유지 영역 겹침 완화
  - 토글 ON/OFF를 새 `v740_keep_on/off` 에셋으로 표시
- 게임 내부 UI 버튼/패널/모달/낚시 HUD를 v740 에셋 톤으로 정리
  - 줄무늬/대각선 반짝임/불필요한 선 효과 제거
  - 버튼은 텍스트 없는 2.5D 글로시 프레임으로 교체
- 업로드 물고기 시트 기반 도감 물고기 44종 추출
  - `v740_fish_01.png` ~ `v740_fish_44.png`
  - 투명 PNG 형태로 사용
- 업로드 배경 시트 기반 지역 배경 6종 추가
  - `bg_user_ocean`, `bg_user_lake`, `bg_user_harbor`, `bg_user_river`, `bg_user_stream`, `bg_user_deep`
- 원본 업로드 아트 시트를 참고용으로 보관
  - `public/assets/reference/user_*_sheet_v740.png`
- 카카오톡 인앱 브라우저 세로 프레임 대응 유지
- 모바일 뒤로가기 가드 / 입질 안내 UX 유지

## 캐시

- `aqua-fantasia-v7.4.0-user-asset-pack`

## 검증

- `npm run validate`
- `npm run runtime:check`
- `npm run audit`
- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=high`

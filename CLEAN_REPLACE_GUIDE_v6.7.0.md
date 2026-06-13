# Aqua Fantasia v6.7.0 Portrait Rescue + Engine Split

## 적용 방식
- 기존 저장소에서 `.git`만 남기고 전체 교체 권장
- 카카오톡 인앱 브라우저가 orientation lock을 무시해도 게임 화면은 세로 프레임으로만 렌더링됩니다.

## 핵심
- manifest portrait-primary 유지
- Screen Orientation API portrait lock 시도
- 실패 시 CSS portrait cage로 자동 대체
- 경고/회전 안내 팝업 없음
- PortraitGuard 코어 분리
- v6.6 레퍼런스 아트 스타일 유지

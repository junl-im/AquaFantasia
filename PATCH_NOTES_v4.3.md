# AquaFantasia Patch 32: v4.3 Fullscreen Performance Boost

## 핵심
- 첫 터치/첫 클릭/첫 키 입력을 가장 빠르게 잡는 Early Fullscreen Primer 추가
- PWA는 `display: fullscreen` 유지, 일반 브라우저는 자동 몰입 셸로 주소창 높이 대응
- 낚시 화면에서 상단/하단/플로팅 UI를 더 강하게 숨김
- 모바일/카카오/저사양 기기에서 v43 성능 부스트 자동 적용
- 스크롤 중 과한 애니메이션 일시 정지
- Service Worker v4.3.0 캐시 갱신

## 주의
브라우저 정책상 로딩 즉시 강제 전체화면은 제한될 수 있습니다. v4.3은 사용자의 첫 터치 이벤트를 가장 빠른 시점에 잡아 전체화면을 요청합니다.

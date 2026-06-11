# AquaFantasia Patch 11 - v2.2 Mobile Launch Visual Max

## 핵심
- 카카오톡 인앱브라우저 감지 브릿지 추가
- Android Intent 기반 기본/Chrome 브라우저 열기 버튼 추가
- iOS는 링크 복사와 Safari 열기 안내 fallback 제공
- 전체화면 게임모드 버튼 추가
- Screen Wake Lock 지원 브라우저에서 화면 켜짐 유지
- VisualViewport 기반 모바일 주소창/키보드 높이 보정
- PWA manifest display를 fullscreen 우선으로 조정
- Service Worker 캐시 v2.2.0 갱신
- v2.1 저장 데이터 호환 유지, 새 저장 키 aqua_v2.2 추가

## 제한
브라우저 보안 정책상 웹페이지가 사용자 동작 없이 임의로 전체화면 또는 외부 기본 브라우저를 강제 실행할 수는 없습니다. 따라서 버튼 기반 브릿지와 설치형 PWA fullscreen 시작을 조합했습니다.

# AquaFantasia Patch 37 - v4.8 Runtime Diet Clean Build

## 핵심
- v4.8 Runtime Diet 패널 추가
- v46/v47 디버그 패널은 기본 숨김 처리하고 v4.8 통합 패널로 정리
- Service Worker 선캐시를 다시 줄여 초기 업데이트 랙 완화
- 저장 키를 `aqua_v4.8`, `aqua_v4.7`, `aqua_latest_state` 중심으로 유지
- 클린 통파일 제작 기준과 검사 도구 추가
- v4.8 WebP atlas 추가

## 목적
누적 패치로 커진 통파일에서 실제 배포에 필요한 파일만 남길 수 있도록 구조를 정리했습니다.

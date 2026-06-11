# v3.2 Mega Audit Report

## 점검 범위
- index.html 런타임 구조
- onclick 핸들러 존재 여부
- 저장 키 호환성
- PWA 캐시 버전
- manifest 시작 URL
- fish.json 중복 ID
- GitHub Actions용 validate-static.mjs

## 조치
- APP_VERSION 3.2.0 반영
- aqua_v3.2 저장 키 추가
- Visual Atlas 상태 normalize/save/load 체인 연결
- 신규 SVG 에셋을 Service Worker와 validator에 포함
- 신규 어종 ID 중복 없이 15종 추가
- npm run validate 통과 확인

## 다음 대형 후보
- index.html 모듈 분리
- Firebase 클라이언트 저장 구조 축소
- 보스전 난이도 테이블 데이터화
- 지역별 UI 테마를 CSS 변수로 분리

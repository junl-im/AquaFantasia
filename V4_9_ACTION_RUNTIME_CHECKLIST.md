# V4.9 Action Runtime Mobile Checklist

## 모바일 성능
- [x] 저사양/Save-Data/Reduce Motion 자동 감지
- [x] `perf-lite` 클래스 자동 적용
- [x] 낚시 화면 외 애니메이션/오버레이 비활성화
- [x] 기존 v47/v49 Canvas 렌더러 DPR 라이트 모드 유도

## 낚시 액션감
- [x] CAST 버튼 squash/stretch 체감 보강
- [x] 찌 포물선 투척 및 둥실둥실 대기 애니메이션
- [x] 입질 말풍선/물결/터치 링 강조
- [x] 릴 단계 꾹누르기 패드와 기존 릴 액션 연결
- [x] 성공/실패 phase에서 물결/흔들림 피드백

## UI/UX
- [x] 낚시 중 하단 네비게이션, 원핸드 FAB, 몰입 버튼 겹침 제거
- [x] 낚시 가이드 카드 상단 안전 영역 재배치
- [x] 상태 텍스트 하단 오버플로우 방지
- [x] 안전지대 30~70 실전 안내 강화

## PWA / GitHub Actions
- [x] Service Worker 캐시 버전 갱신
- [x] 신규 런타임 파일 precache 포함
- [x] 캐시 클리어 메시지 지원
- [x] `runtime49:action` 검증 스크립트 추가
- [x] 기존 `validate`, `audit`, `runtime:check` 통과 확인 대상

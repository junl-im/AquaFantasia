# Clean Bundle v5.5 Mobile Feel

이 번들은 v5.4 Result/Shop Polish 상태에 v5.5 Mobile Feel 런타임을 추가한 덮어쓰기용 구조입니다.

## 런타임 연결 순서

`index.html`은 기존 순서를 유지하면서 마지막에 v5.5 런타임을 로드합니다.

1. v49 Pixi Runtime Connect
2. v50 Performance Runtime
3. v51 Stability Runtime
4. v53 Casual UX Polish
5. v54 Result/Shop Polish
6. v49 Action Mobile Patch
7. v55 Mobile Feel Runtime

v5.5는 앞선 런타임의 DOM/API를 깨지 않고 후처리합니다. 특히 `AquaFantasiaV53.fishing.setDown()`과 `AquaFantasiaV53.fishing.hook()`을 우선 사용하고, 없을 때 기존 전역 함수로 폴백합니다.

## 보존한 구조

- GitHub Pages 정적 배포 구조
- Firebase Spark 플랜 대응 파일
- PWA manifest/offline/sw 구조
- 기존 v4.8~v5.4 검증 스크립트
- Phaser 단일 HTML 프로토타입 파일

## 정리 방향

이번 패치는 위험한 대규모 삭제 대신 런타임 겹침을 CSS/JS 오버레이로 정리했습니다. 다음 클린 빌드에서는 legacy PATCH_NOTES/CHECKLIST 파일을 release zip에서 제외하고, 런타임 패널도 현재 버전 중심으로 축소하는 것을 권장합니다.

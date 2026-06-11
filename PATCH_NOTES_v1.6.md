# Aqua Fantasia Patch 05 - v1.6 PWA Visual Max

## 목표
GitHub Pages 무료 배포 환경에서 모바일 웹게임을 더 앱처럼 보이게 만들고, 그래픽/인터페이스/성능을 함께 보정했습니다.

## 주요 변경
- Web App Manifest 추가: 홈화면 설치형 앱 지원
- Service Worker 추가: 핵심 파일 오프라인 캐시, 재방문 속도 개선
- offline.html 추가: 네트워크 단절 시 안내 화면
- 앱 아이콘 추가: 192, 512, maskable 512, Apple touch icon
- 설치 버튼 추가: 상단, 로그인 화면, 마을 앱 모드 카드
- 앱 모드/온라인 상태/서비스워커 상태 표시
- 성능 점검 버튼 추가: 약 1.2초 FPS 샘플링 후 절전 그래픽 자동 전환
- 몰입 모드 버튼 추가: 지원 브라우저에서 전체화면 전환
- 그래픽 3차 보정: 수면 caustics, liquid border, micro shine, region card glow
- 저장 호환: aqua_v1.1~aqua_v1.5 데이터를 유지하고 aqua_v1.6 키 추가

## 추가 파일
- manifest.webmanifest
- sw.js
- offline.html
- assets/icons/icon-192.png
- assets/icons/icon-512.png
- assets/icons/maskable-512.png
- assets/icons/apple-touch-icon.png

## GitHub Desktop 적용
1. 기존 저장소에 파일 덮어쓰기
2. GitHub Desktop에서 변경사항 확인
3. Commit: `Patch 05: v1.6 PWA visual max`
4. Push origin
5. GitHub Pages 배포 후 모바일 브라우저에서 한 번 접속
6. 브라우저 설치 버튼 또는 게임 내 `📲 설치` 버튼으로 홈화면 추가

## 참고
첫 접속은 온라인이어야 Service Worker가 캐시를 만들 수 있습니다. 이후 재방문부터 오프라인/약한 네트워크 복구 효과가 적용됩니다.

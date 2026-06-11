# AquaFantasia v1.8 Forge Visual Max

웹 모바일 낚시 RPG **AquaFantasia** 개발 버전입니다.

현재 패치: **Patch 07 - v1.8 Forge Visual Max**

- 정적 웹앱: `index.html` 단일 실행
- 배포: GitHub Pages
- 백엔드: Firebase Authentication + Cloud Firestore
- 로그인: 익명, 이메일/비밀번호, Google
- 저장: localStorage + Firestore `users/{uid}`
- 랭킹: Firestore `leaderboard/{uid}`
- 앱화: PWA manifest + Service Worker + 오프라인 화면
- 성장: 장비 구매, 미끼, 낚싯대 +0~+10 강화

## 실행

브라우저에서 `index.html`을 열거나 GitHub Pages로 배포하세요. GitHub Pages에서는 `data/fish.json`, `manifest.webmanifest`, `sw.js`가 함께 배포되어야 합니다.

## Firebase 설정

자세한 설정은 `FIREBASE_SETUP_GITHUB_DESKTOP.md`를 참고하세요.

필수 콘솔 작업:

1. Authentication에서 Anonymous, Email/Password, Google 활성화
2. Authorized domains에 `junl-im.github.io` 추가
3. Firestore Database 생성
4. `firestore.rules` 내용을 Rules에 반영

## 주요 폴더

```text
assets/images/   게임 이미지
assets/icons/    PWA 아이콘
data/            어종/지역 JSON
index.html       게임 본문
sw.js            오프라인 캐시 Service Worker
manifest.webmanifest PWA 앱 설정
```

## 패치 히스토리

- Patch 02 v1.3: 어종 데이터 분리, 지역별 희귀도/가격/도감 시스템
- Patch 03 v1.4: 프리미엄 글래스 UI, 그래픽 절전/고급 토글, 성능 보정
- Patch 04 v1.5: 장비 공방, 낚싯대/미끼 구매 및 장착
- Patch 05 v1.6: PWA 설치형 앱, 오프라인 캐시, 앱 아이콘
- Patch 06 v1.7: 데일리 미션, 출석, 시즌 미션
- Patch 07 v1.8: 상점/강화/재화 밸런스, 포지 연출, Scheduler/API 기반 렌더링 보정

## 다음 개발 우선순위

1. 지역별 보스 어종과 보스전 낚시 패턴
2. 시즌 리더보드와 주간 보상
3. 강화 재료/제련석 추가
4. 거래소와 길드는 Cloud Functions 또는 서버 검증 로직 설계 후 오픈

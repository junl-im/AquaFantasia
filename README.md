# AquaFantasia v2.0 Actions Rank Visual Max

웹 모바일 낚시 RPG **AquaFantasia** 개발 버전입니다.

현재 패치: **Patch 09 - v2.0 Actions Rank Visual Max**

- 정적 웹앱: `index.html` 단일 실행
- 자동 배포: GitHub Actions + GitHub Pages
- 검증: `tools/validate-static.mjs`로 HTML/JS/JSON/PWA 파일 검사
- 백엔드: Firebase Authentication + Cloud Firestore
- 로그인: 익명, 이메일/비밀번호, Google
- 저장: localStorage + Firestore `users/{uid}`
- 랭킹: Firestore `leaderboard/{uid}`, `bossLeaderboard/{uid}`
- 앱화: PWA manifest + Service Worker + 오프라인 화면
- 성장: 장비 구매, 미끼, 낚싯대 +0~+10 강화
- 보스전: 지역별 보스 어종, 돌진 파동, 퍼펙트 카운터, 보스 기록
- v2.0 신규: 시즌 랭킹 UI, 보스 토벌 랭킹 UI, 자동 배포 상태 카드, PWA/성능 함수 복구

## 실행

브라우저에서 `index.html`을 열거나 GitHub Pages로 배포하세요. GitHub Pages에서는 `data/fish.json`, `manifest.webmanifest`, `sw.js`, `assets/icons/*`가 함께 배포되어야 합니다.

## GitHub Actions 자동 배포

`.github/workflows/pages.yml`가 추가되어 있습니다.

1. GitHub Desktop에서 변경사항 Commit
2. Push origin
3. GitHub 저장소의 **Actions** 탭에서 `Deploy AquaFantasia to GitHub Pages` 실행 확인
4. GitHub 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정

워크플로는 `main` 브랜치 push 또는 수동 실행(`workflow_dispatch`)으로 동작합니다.

## 로컬 검증

Node.js가 설치되어 있다면 아래 명령으로 정적 파일 검사를 실행할 수 있습니다.

```bash
npm run validate
```

의존성 설치는 필요 없습니다.

## Firebase 설정

자세한 설정은 `FIREBASE_SETUP_GITHUB_DESKTOP.md`를 참고하세요.

필수 콘솔 작업:

1. Authentication에서 Anonymous, Email/Password, Google 활성화
2. Authorized domains에 `junl-im.github.io` 추가
3. Firestore Database 생성
4. `firestore.rules` 내용을 Rules에 반영

v2.0부터 보스 랭킹용 `bossLeaderboard/{uid}` 컬렉션 규칙이 추가되었습니다.

## 주요 폴더

```text
.github/workflows/ GitHub Actions 자동 배포 워크플로
assets/images/     게임 이미지
assets/icons/      PWA 아이콘
data/              어종/지역 JSON
tools/             정적 검증 스크립트
index.html         게임 본문
sw.js              오프라인 캐시 Service Worker
manifest.webmanifest PWA 앱 설정
```

## 패치 히스토리

- Patch 02 v1.3: 어종 데이터 분리, 지역별 희귀도/가격/도감 시스템
- Patch 03 v1.4: 프리미엄 글래스 UI, 그래픽 절전/고급 토글, 성능 보정
- Patch 04 v1.5: 장비 공방, 낚싯대/미끼 구매 및 장착
- Patch 05 v1.6: PWA 설치형 앱, 오프라인 캐시, 앱 아이콘
- Patch 06 v1.7: 데일리 미션, 출석, 시즌 미션
- Patch 07 v1.8: 상점/강화/재화 밸런스, 포지 연출, Scheduler/API 기반 렌더링 보정
- Patch 08 v1.9: 보스 어종, 보스 릴 패턴, 시네마틱 보스 오버레이
- Patch 09 v2.0: GitHub Actions 자동 배포, 시즌/보스 랭킹, PWA/성능 함수 복구, 그래픽 7차 보정

## 다음 개발 우선순위

1. 주간 보상 수령/메일함 시스템
2. 보스 재료/장비 각성
3. 강화 재료/제련석 추가
4. 거래소와 길드는 Cloud Functions 또는 서버 검증 로직 설계 후 오픈


## Patch v2.1 Reward Vault Visual Max

- 주간 랭킹 보상함 추가
- 시즌/보스 랭킹 예상 보상 수령 시스템 추가
- Visual Lab FPS 표시 및 IntersectionObserver 기반 화면 최적화 추가
- GitHub Actions 정적 검증 기준 v2.1로 갱신


## v2.3 Sensory Visual Max
- Web Audio 기반 사운드/햅틱/타격감 엔진 추가
- 모바일 터치 리플, 임팩트 플래시, 릴 피드백 강화
- GitHub Actions 자동 배포 구조 유지

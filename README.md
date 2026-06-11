# AquaFantasia

웹 모바일 낚시 RPG **AquaFantasia** 개발 버전입니다.

현재 패치: **v1.2 Stability Patch**

- 정적 웹앱: `index.html` 단일 실행
- 배포: GitHub Pages
- 백엔드: Firebase Authentication + Cloud Firestore
- 로그인: 익명, 이메일/비밀번호, Google
- 저장: localStorage + Firestore `users/{uid}`
- 랭킹: Firestore `leaderboard/{uid}`

## 실행

브라우저에서 `index.html`을 열거나 GitHub Pages로 배포하세요.

## Firebase 설정

자세한 설정은 `FIREBASE_SETUP_GITHUB_DESKTOP.md`를 참고하세요.

필수 콘솔 작업:

1. Authentication에서 Anonymous, Email/Password, Google 활성화
2. Authorized domains에 `junl-im.github.io` 추가
3. Firestore Database 생성
4. `firestore.rules` 내용을 Rules에 반영

## 폴더

```text
assets/images/   게임 이미지
css/             향후 분리용
js/              향후 분리용
data/            어종/지역 JSON 확장용
firebase/        Firebase 관련 문서/확장용
```

## 다음 개발 우선순위

1. Patch 02: 어종 데이터를 `data/fish.json`으로 분리
2. 지역별 확률 테이블 추가
3. 리더보드 시즌제 도입
4. PWA manifest/service worker 추가
5. 거래소와 길드는 Cloud Functions 또는 검증 로직 설계 후 오픈


## Patch 02 - v1.3 Fish Data

- `data/fish.json` 어종 데이터 파일 추가
- 지역별 출현 어종, 희귀도, 가격, 경험치, 가중치 적용
- 도감 화면 실제 어종 목록/발견 진행도 표시
- 가방/기록 화면에 이모지와 희귀도 배지 표시
- 기존 `aqua_v1.1`, `aqua_v1.2` 저장 데이터 호환 유지

GitHub Pages에서는 `data/fish.json`이 자동으로 로드됩니다. 로컬에서 `index.html`을 파일로 바로 열면 브라우저 정책 때문에 JSON 로드가 막힐 수 있지만, 내장 데이터 fallback이 있어서 게임은 계속 실행됩니다.

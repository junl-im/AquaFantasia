# AquaFantasia Firebase + GitHub Desktop 설정 가이드

이 패키지는 **GitHub Pages 무료 호스팅 + Firebase 무료 Spark 플랜** 기준으로 정리된 버전입니다. 별도 빌드 없이 `index.html`을 그대로 배포합니다.

## 1. GitHub Desktop 배포 구조

권장 저장소 루트:

```text
AquaFantasia/
├─ index.html
├─ assets/images/
├─ data/
├─ firebase/
├─ js/
├─ css/
├─ firestore.rules
├─ storage.rules
├─ firebase.json
├─ .nojekyll
├─ .gitignore
└─ README.md
```

GitHub Desktop에서 이 폴더를 저장소로 추가하고 `main` 브랜치에 커밋/푸시하면 됩니다.

GitHub Pages 설정:

1. GitHub 저장소 → **Settings** → **Pages**
2. **Build and deployment** → **Deploy from a branch**
3. Branch: `main`, Folder: `/root`
4. Save
5. 배포 URL: `https://junl-im.github.io/AquaFantasia/`

## 2. Firebase 콘솔 설정

Firebase 콘솔에서 프로젝트 `fishing-game-71e8b` 기준으로 진행합니다.

### Authentication

**Build → Authentication → Sign-in method**에서 아래 3개를 활성화하세요.

- Anonymous
- Email/Password
- Google

그 다음 **Authentication → Settings → Authorized domains**에 아래 도메인을 추가하세요.

```text
junl-im.github.io
localhost
127.0.0.1
```

`localhost`, `127.0.0.1`은 로컬 테스트용입니다.

### Firestore Database

1. **Build → Firestore Database → Create database**
2. Production mode 선택
3. 가까운 리전 선택
4. Rules 탭에 `firestore.rules` 내용을 붙여넣고 Publish

### Storage

현재 게임은 `assets/images/` 로컬 이미지를 쓰므로 Storage는 필수 아님입니다. 나중에 프로필 이미지 업로드를 쓸 경우:

1. **Build → Storage** 활성화
2. Rules 탭에 `storage.rules` 내용 붙여넣기

## 3. 코드에 반영된 Firebase 기능

`index.html`에 Firebase v12 Modular SDK CDN 방식이 적용되어 있습니다.

적용 완료:

- 익명 로그인
- 이메일 회원가입/로그인
- Google 로그인 팝업
- Auth 상태 감지
- Firestore 개인 저장 데이터: `users/{uid}`
- Firestore 글로벌 리더보드: `leaderboard/{uid}`
- localStorage 백업 저장
- Firebase 연결 상태 표시

## 4. 무료 플랜 운영 주의사항

- 리더보드는 실시간 리스너를 사용하므로 사용자가 많아지면 읽기 횟수가 증가합니다.
- MVP 단계에서는 리더보드 상위 20명만 구독하도록 제한해두었습니다.
- 게임 저장 데이터가 커지면 `users/{uid}` 문서 1개에 모두 저장하는 방식 대신 `inventory`, `catchHistory`를 하위 컬렉션으로 분리하세요.

## 5. 현재 코드에서 보강한 부분

- 기존 v1.1 코드의 Firebase 더미 로그인 제거
- `db.collection(...)` compat 방식 제거 후 Firebase v12 Modular SDK 적용
- `Set` 저장/불러오기 문제 수정
- 낚시 타이밍 실패 시 버튼이 안 돌아올 수 있는 문제 수정
- 인벤토리 역순 렌더링 후 판매 인덱스가 어긋나는 문제 수정
- Firestore 기본 보안 규칙 추가
- GitHub Pages용 `.nojekyll`, `.gitignore` 추가


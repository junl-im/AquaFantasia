# AquaFantasia v2.0 GitHub Actions 자동 배포 설정

## 1. GitHub Desktop에서 적용

1. 이 패치 파일을 기존 저장소에 덮어쓰기
2. GitHub Desktop에서 변경사항 확인
3. Commit 메시지 예시:

```text
Patch 09: v2.0 actions rank visual max
```

4. Push origin

## 2. GitHub Pages Source 변경

GitHub 저장소 웹페이지에서:

1. Settings
2. Pages
3. Build and deployment
4. Source를 **GitHub Actions**로 변경

이후 `main` 브랜치에 Push할 때마다 `.github/workflows/pages.yml`이 실행됩니다.

## 3. Actions 탭 확인

저장소 상단 **Actions** 탭에서 아래 워크플로가 초록색으로 성공해야 합니다.

```text
Deploy AquaFantasia to GitHub Pages
```

실패하면 `Validate HTML, JSON, Service Worker, and game scripts` 단계 로그를 먼저 확인하세요.

## 4. 로컬 검증

Node.js가 설치되어 있으면 Push 전에도 검사할 수 있습니다.

```bash
npm run validate
```

외부 npm 패키지는 사용하지 않습니다.

## 5. 주의

- GitHub Pages Source가 기존 `Deploy from a branch`로 되어 있으면 Actions 배포가 보이지 않을 수 있습니다.
- `firestore.rules`도 Firebase 콘솔에서 다시 Publish해야 v2.0 보스 랭킹 제출이 정상 작동합니다.

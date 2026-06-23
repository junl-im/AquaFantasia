# AquaFantasia v2.1.26

## v2.1.26 변경사항

- GitHub Actions `npm run build`에서 실패한 `src/styles.css` PostCSS 문법 오류를 수정했습니다.
- 실패 원인은 v2.1.25 조이스틱 transform fallback의 중첩 `var()` 괄호가 하나 부족했던 것입니다.
- 수정 전 문제 지점:
  - `src/styles.css` 41585줄 근처
  - `transform: var(--v2125-joystick-transform, ... translate(-50%, -50%)))))`
- 수정 후에는 `var()` 5개와 `translate()` 1개의 괄호가 모두 닫히도록 보정했습니다.
- `tools/check-v2126-build-css-syntax.mjs`를 추가했습니다.
  - `src/styles.css`의 괄호/중괄호/대괄호 균형을 검사합니다.
  - v2.1.25에서 발생한 unclosed bracket 회귀 패턴을 직접 차단합니다.
  - 플레이어 8방향 32프레임, 오프닝 MP4, 방향 고정 토큰도 계속 검사합니다.
- `npm run validate`에 v2.1.26 CSS 문법 검증을 연결했습니다.
- 오프닝 영상, 로그인 유지 토글, 플레이어 방향/걷기 모션, 우측 상·하단 UI, 낚시 UI 안정화 구조는 v2.1.25 기준을 유지했습니다.

## 고정 유지 항목

- `이 기기에서 로그인 유지` 토글은 현재 CSS 아쿠아 토글 스타일을 유지합니다.
- 오프닝 영상은 최초 게임 시작 로딩 전용입니다.
- 홈/닫기/메뉴 복귀는 오프닝 영상과 연결되지 않아야 합니다.
- 플레이어는 8방향 32프레임 구조를 유지합니다.
- 캐릭터 방향 보호 토큰은 유지합니다.
  - `ACTOR_DIRECTION_TEXTURE_FIX`
  - `ACTOR_DIRECTION_TEXTURES`
  - `actorDirectionFromVector`
  - `actorTextureUrl`
  - `actorDirectionQaPasses`
- 루트 Markdown은 `README.md` 하나만 유지합니다.
- `node_modules`, `dist`, `reports`, 백업 폴더, `.log`, `*_NOTES.md`는 ZIP에 포함하지 않습니다.
- 금지 registry/internal 문자열은 포함하지 않습니다.

## 검증 기준

- v2.1.26 작업본에서 `npm run validate`가 통과해야 합니다.
- v2.1.26 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.25 통파일에 v2.1.26 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 `2.1.26`으로 동기화되어야 합니다.
- 가능한 환경에서는 `npm run build`까지 통과해야 합니다. 현재 작업 컨테이너는 `node_modules`가 없어 build/typecheck는 실행 환경 의존 실패가 날 수 있습니다.

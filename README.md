# AquaFantasia v2.1.18

## v2.1.18 변경사항

- 버전을 `2.1.18`로 동기화했습니다.
- `v2118-character-water-ui-root`를 추가해 v2.1.17의 입력/낚시/메뉴 안정화 위에서 캐릭터 모션, 타일 밸런스, 우측 상단 조작바/HUD 간격을 다시 조정했습니다.
- 사용자가 마음에 든 `이 기기에서 로그인 유지` 토글은 검증 고정했습니다. PNG/이미지 배경을 다시 입히지 않고, 작고 얇은 CSS 아쿠아 토글과 `✓` 체크 표시만 유지합니다.
- 마을 일반 바닥에 물 타일이 섞여 보이던 문제를 수정했습니다. `grass`는 기존 녹색 땅 타일 후보로 되돌리고, `sea`는 신규 v2118 `tiles_32x32/sea_and_beach` 물 타일 후보를 실제 sea 후보로 사용하도록 분리했습니다. `sand`, `wood`, `plaza`, `stone`도 물색이 과하게 섞이지 않도록 후보를 재정리했습니다.
- 새 캐릭터 프레임을 `public/assets/v2118/characters/player`에 등록했습니다. 업로드 ZIP 내부에는 7방향 × 4프레임만 확인되어, 누락된 한 대각선은 제공된 후면 대각선 프레임의 좌우 반전 파생본으로 만들어 8방향 × 4프레임 런타임 세트를 완성했습니다.
- 플레이어는 12시, 1시 반, 3시, 4시 반, 6시, 7시 반, 9시, 10시 반 방향에 따라 텍스처가 바뀌고, 이동 중에는 4프레임 워킹 모션이 적용됩니다.
- 일반 NPC는 기존 `v2047` 8방향 캐릭터 에셋을 계속 사용합니다. 최소 12시/3시/6시/9시는 물론 대각선까지 이동 방향에 따라 이미지가 바뀌도록 기존 방향 시스템을 유지했습니다.
- 우측 상단 조작바는 v2.1.17보다 조금 키워 아이콘 잘림을 줄이고, 늘어난 만큼 HUD도 조금 더 길게 표시되도록 보정했습니다. 서로 겹치지 않도록 `--v2118-command-width` 기준 max-width를 적용했습니다.
- 건물 정보카드는 현재 방향을 유지하면서 폭/높이/초상 크기/본문 간격만 다듬었습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭정보창, 건물정보창의 글씨 번짐/겹침 방지 규칙을 유지하고, 공통 아쿠아 카드 스타일을 이어갑니다.
- 낚시 릴/찌/감기/풀기 UI는 v2.1.17의 중앙 고정 원칙을 유지하면서 아이콘/카드 크기 제한을 보강했습니다.

## 검증 기준

- v2.1.18 작업본에서 `npm run validate`가 통과해야 합니다.
- v2.1.18 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.17 통파일에 v2.1.18 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 `2.1.18`로 동기화되어야 합니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- 내부 registry 오염 금지 문자열 검사를 통과해야 합니다.
- `ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses` 토큰은 유지합니다.
- v2.1.10 신규 에셋 278개와 v2.1.18 캐릭터/타일 에셋 manifest를 유지합니다.
- GitHub Actions workflow `validate-and-deploy` 기준으로 검증 가능한 구조를 유지합니다.


### v2.1.18 추가 확인

- 업로드 ZIP에는 7방향 × 4프레임 캐릭터 소스가 확인되어, 런타임용 `public/assets/v2118/characters/player`에는 8방향 × 4프레임 세트를 완성해 등록했습니다. 누락 방향은 제공 프레임의 좌우 반전 파생본으로 보정했습니다.
- 일반 NPC는 기존 `public/assets/v2047/characters`에 핵심 NPC 6종 × 8방향 정적 이미지가 이미 있어 방향 전환을 유지하고 검증 스크립트로 고정했습니다.
- 로그인 유지 토글은 현재 승인된 순수 CSS 아쿠아 토글 스타일로 고정했으며 이미지 배경을 다시 입히지 않습니다.

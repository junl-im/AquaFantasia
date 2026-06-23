# AquaFantasia v2.1.10

## v2.1.10 변경사항

- 버전을 `2.1.10`으로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- 새로 제공된 `aqua_fantasia_individual_assets_png.zip` 에셋 278개를 `public/assets/v2110/` 아래에 정리해 포함했습니다.
- `public/assets/v2110/asset_manifest.json`을 생성해 에셋 개수, 폴더별 분류, 이미지 치수를 검증 가능하게 만들었습니다.
- 물고기 도감/포획/최근 포획에 쓰이는 `fishDex` 이미지를 신규 `common_tropical` / `rare_deepsea` PNG로 연결했습니다.
- 낚시 화면에 신규 낚시 소품 일부를 제한 크기 장식으로 연결했습니다. 화면을 가득 메우지 않도록 `max-width`, `max-height`, `pointer-events:none`을 강제합니다.
- 32x32 바다 타일 1종을 낚시 화면의 아주 약한 수면 텍스처 오버레이로 연결했습니다.
- 신규 UI 버튼/도감 카드 PNG는 로그인 유지 토글에는 사용하지 않고, 일반 액션 버튼/도감 카드에만 약하게 적용했습니다.
- 로그인 유지 토글은 이전 요청 기준대로 이미지 배경 없이 얇은 순수 CSS 아쿠아 토글 상태를 유지합니다.
- 캐릭터 프레임은 이번 ZIP 기준 28개, 즉 7방향 × 4프레임만 확인되었습니다. 기존 8방향 캐릭터 방향 로직은 안정성 때문에 수정하지 않고 에셋만 포함/검증했습니다.
- `tools/check-v2110-asset-integration-pass.mjs`를 추가하고 `npm run validate`에 연결했습니다.

## 유지 규칙

- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- 금지 registry 문자열(`packages.applied-caas`, `applied-caas-gateway`, `10.192.`, `internal.api.openai`)을 포함하지 않습니다.
- 캐릭터 방향 고정 토큰(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 제거하지 않습니다.
- `v2.1.8` 안정 롤백 기준과 `v2.1.9` 터치/상점/낚시 안정화 기준을 유지한 상태에서 신규 에셋만 제한적으로 연결합니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- v2.1.10 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.9 통파일에 v2.1.10 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- 통파일 ZIP과 패치 ZIP 모두 `unzip -t`를 통과해야 합니다.

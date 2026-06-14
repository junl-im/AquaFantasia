# AquaFantasia v8.1.0 패치 노트

## 패치명

Asset Fit + Start Keep Button Restore

## 가장 중요한 수정

첫 시작 화면의 `이 기기에서 로그인 유지`를 삭제하지 않고 실제 버튼형 UI로 복구했다. 배경 이미지에 구워져 있던 원형 체크/글씨만 지우고, 그 자리에 실제 클릭 가능한 DOM 버튼을 배치했다.

## 에셋 반영

- `AquaFantasia_asset_pack_split_plus.zip` 분석
- `AquaFantasia_v12_exact_reference_fishing_style_assets.zip` 분석
- 에셋을 `public/assets/v12`로 새 분류
- 2.5D/3D 렌더드 PNG/WebP 우선 적용
- UI 버튼과 패널은 글씨 없는 blank 버전을 사용해 텍스트 겹침 방지

## 화면 수정

- 시작 화면: `익명 서버연동` 아래에 로그인 유지 버튼 복구
- 장비 화면: 카드 높이, 아이콘 영역, 텍스트 영역 재정렬
- 상점 화면: 상품 카드와 구매 버튼 가독성 보강
- 미션 화면: 미션 카드와 진행도 표시 보강
- 도감/마을 화면: v12 렌더드 배경과 패널 톤 적용
- 낚시 화면: v12 물고기/찌/캐릭터 기준 스케일 보정

## 런타임/검증

- `APP_VERSION = 8.1.0`
- `CACHE_NAME = aqua-fantasia-v8.1.0-asset-fit-start-keep`
- 신규 검증 스크립트: `tools/check-v810-asset-fit-start-keep.mjs`
- 통과 명령: `npm run validate`, `npm run typecheck`, `npm run build`

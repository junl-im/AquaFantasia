# AquaFantasia v2.0.99

## v2.0.99 변경사항

이번 패치는 GitHub Actions `npm run validate` 실패를 수정하는 **패키지 청결/백업 산출물 제거 패치**입니다. UI, 마을, 낚시 런타임 코드는 변경하지 않았습니다.

- GitHub Actions에서 실패한 `AquaFantasia_backup_v1/dist/...` 잔여 산출물 문제를 수정했습니다.
- `tools/clean-old-patch-docs.mjs`가 이제 Markdown 문서뿐 아니라 백업 폴더, `dist`, `reports`, 로그 파일, `*_NOTES.md`까지 정리합니다.
- `tools/check-v2099-clean-package-artifacts.mjs`를 추가해 백업/빌드 산출물이 다시 패키지에 섞이면 검증에서 즉시 실패하도록 했습니다.
- `npm run validate`를 `v2.0.99` 전용 패키지 청결 검증으로 연결했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version을 `v2.0.99`로 동기화했습니다.

## v2.0.98 유지 내용

- 하단 메뉴바는 우측 아래 한줄형 `홈 / 가방 / 퀘스트 / 지도` 구조를 유지합니다.
- 우측 상단 조작 레일과 HUD 공간 조정, 건설 버튼 상태 동기화, 낚시 화면 복구, 상점 본문 호환 구조, 마을 터치 기준 보정은 그대로 보존합니다.
- 캐릭터 방향 로직은 수정하지 않았습니다.

## 검증

- `npm run validate` 통과
- 통파일 ZIP 검증 통과
- `v2.0.98` 통파일에 `v2.0.99` 패치 ZIP 덮어쓰기 검증 통과

## 패키징 규칙

- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- `node_modules`, `dist`, `reports`, 백업 폴더, 임시 로그, `*_NOTES.md`는 ZIP에 포함하지 않습니다.
- 내부 registry 오염 문자열 검사를 유지합니다.

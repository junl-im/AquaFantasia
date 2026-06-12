# AquaFantasia v4.8 Clean Runtime Bundle

이 ZIP은 v4.8 기준 실행에 필요한 파일 중심으로 정리한 통파일입니다.

제거한 것:
- 오래된 PATCH_NOTES v1~v4.7 대부분
- 오래된 TEST_CHECKLIST/AUDIT 문서
- 현재 index/sw/manifest/src/tools에서 참조하지 않는 assets

검증:
```bash
npm run validate
npm run audit
npm run runtime:check
```

# Aqua Fantasia v6.4.0a Typecheck Hotfix

## Fix

- GitHub Actions `npm run typecheck` 실패 원인 수정.
- `src/main.ts`에서 현재 TypeScript DOM lib에 없는 `OrientationLockType` 참조를 제거했습니다.
- 화면 방향 고정 시도는 유지하되, 브라우저/타입 환경 차이 때문에 실패해도 조용히 넘어가도록 유지했습니다.

## Error fixed

```txt
error TS2552: Cannot find name 'OrientationLockType'. Did you mean 'OrientationType'?
```

## Runtime impact

- 게임 로직 변경 없음.
- 앱 버전은 `6.4.0` 유지.
- PWA 캐시 버전도 유지.
- 순수 TypeScript 호환성 핫픽스입니다.

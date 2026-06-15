# AquaFantasia v9.3.0

모바일 세로 고정 낚시 웹게임 패치입니다. 이번 버전은 v9.2.0의 귀여운 수집형 톤과 WebGL 수중 배경을 유지하면서, 낚시 액션감과 포획 연출을 강화했습니다.

## v9.3.0 핵심 변경

- 낚시 캐릭터를 `v93/characters/fisher_boat_cute_action.png`로 교체했습니다.
- 캐스팅 시 포물선 궤적, 버블, 반짝임 이펙트를 추가했습니다.
- 찌 착수 시 귀여운 물보라 PNG 이펙트를 추가했습니다.
- 입질 발생 시 `물었다!` 버스트 이펙트를 추가했습니다.
- 릴링 시작과 PERFECT 장력 구간에 액션 배지를 표시합니다.
- 포획 성공 시 골드 보상 버스트와 하트 버블 이펙트를 추가했습니다.
- 포획 결과 팝업을 v93 전용 고화질 PNG 패널로 교체했습니다.
- 릴 패널과 최근 포획 패널을 v93 PNG 프레임으로 보강했습니다.
- 기존 PixiJS 낚시 런타임과 DOM UI는 유지했습니다.
- WebGL 수중 배경 레이어는 유지하며, 미지원 기기에서는 기존 이미지 배경으로 fallback됩니다.
- 문서는 계속 `README.md` 하나만 유지합니다.

## 배포 구조

- GitHub Desktop + GitHub Pages 배포 구조 유지
- Vite / TypeScript / PixiJS 8 / Howler.js 유지
- Firebase Spark 플랜 기준 구조 유지
- PWA / Service Worker 캐시 `aqua-fantasia-v9.3.0-cute-action-webgl-polish`
- 회전 방지 정책 유지: 세로 고정, 가로 레이아웃 전환 금지

## 검증 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 문서 정리 정책

이 패치부터도 계속 `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES`, `reports/`를 만들지 않습니다. 기존 저장소에 남아 있는 오래된 문서는 `npm run validate` 단계의 `tools/clean-old-patch-docs.mjs`가 자동 정리합니다.

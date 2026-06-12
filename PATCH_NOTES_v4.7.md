# AquaFantasia Patch 36 - v4.7 Pixi Fishing Renderer

- 낚시 화면 전용 캔버스 렌더러 레이어 추가
- PixiJS 8 전환용 `src/engine/fishingRenderer.ts` 추가
- WebP Atlas v47 추가
- 찌, 낚싯줄, 수면 리본, 물고기 궤적을 저비용 렌더링
- 모바일 DPR 자동 캡핑 및 FPS 저하 시 perf-lite 전환
- 기존 DOM 낚시 UI와 저장 데이터 유지

# AquaFantasia v8.9.0

## 이번 패치 목적

v8.9.0은 새로 제공된 `AquaFantasia_3D_Underwater_PlayCanvas_WebGL_WebGPU_AssetPack`를 실제 런타임에 배치하는 패치입니다. 통짜 화면 이미지를 다시 덮는 방식이 아니라, 수중 월드 배경 / 카스틱 / 버블 / HUD 아이콘 / 패널 / 버튼을 역할별로 분리해서 적용했습니다.

## 핵심 변경

- `public/assets/v3d_underwater`에 새 3D 수중 에셋 팩 전체를 배치했습니다.
- `public/assets/v89`에 모바일 런타임용으로 재가공한 배경, 캐릭터, 아이콘, UI 프레임을 생성했습니다.
- 마을 / 장비 / 가방 / 도감 / 상점 / 미션 / 랭킹 화면 배경을 v89 수중 월드 배경으로 교체했습니다.
- 랭킹은 심해/어비스 계열 배경과 deep 패널을 사용하도록 분리했습니다.
- 낚시터는 지역별 v89 수중 배경을 PixiJS stage에 직접 연결했습니다.
- 낚시 화면에 카스틱, 버블, 심도 안개 레이어를 추가해 2.5D~3D 느낌을 강화했습니다.
- 하단 탭 네비는 v3d HUD 프레임과 탭 에셋 기반으로 다시 정리했습니다.
- 아이콘은 v3d HUD 아이콘을 v89 경로로 재보정해서 연결했습니다.
- 캐릭터는 기존 보정 캐릭터를 한 번 더 샤픈/명암 보정한 v89 PNG로 교체했습니다.
- 기존 `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES`는 생성하지 않고 README 하나만 유지합니다.

## 전체화면 / 세로 고정 정책

- 일반 브라우저는 사용자 터치 이후 `requestFullscreen({ navigationUI: 'hide' })`를 시도합니다.
- 카카오/인앱 브라우저는 기존 회전 버그를 막기 위해 Fullscreen API 호출을 계속 제한합니다.
- Screen Orientation Lock API는 계속 사용하지 않습니다.
- 세로 전용 레이아웃은 CSS/viewport cage와 manifest `orientation: portrait-primary`로 유지합니다.

## PlayCanvas / WebGL / WebGPU 방향

이번 패치는 전체 엔진 교체가 아니라 `배경 전용 3D 수중 월드 레이어`를 붙이는 안전 단계입니다. 현재 구조는 다음 순서로 확장하는 것을 기준으로 합니다.

1. v8.9 안정 브랜치: PixiJS 8 낚시 런타임 + DOM UI + v3d 수중 배경/FX 에셋
2. 다음 실험 브랜치: PlayCanvas 또는 raw WebGL/WebGPU 기반 배경 전용 월드 레이어
3. 합류 기준: 카카오/인앱 세로 고정, 일반 브라우저 전체화면, 모바일 FPS, 메모리 사용량 검증 통과

## 적용 방법

기존 프로젝트 루트에 ZIP 내용을 덮어쓴 뒤 다음을 실행합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 문서 정책

패치별 MD 파일을 더 이상 누적하지 않습니다. 프로젝트 문서는 `README.md` 하나만 계속 갱신합니다.

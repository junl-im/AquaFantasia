# Aqua Fantasia v7.6.0

UI Rescue + Mission Expansion build.

# Aqua Fantasia v7.4.0

세로 전용 2.5D 모바일 캐주얼 낚시 게임 프로토타입입니다.

## v7.4.0 핵심

- 업로드한 `낚시.zip` 에셋을 기준 아트팩으로 통합
- UI 프레임, 버튼, 배경, 물고기 도감 이미지를 v740 톤으로 교체
- 물고기 도감은 배경 없는 투명 PNG 기반으로 재구성
- 시작 화면 로그인 유지 토글 겹침 완화
- 낚시 화면, 마을, 장비, 도감, 상점, 미션, 팝업 UI 톤 정리
- 카카오톡 인앱 브라우저 세로 프레임 대응 유지
- Vite + TypeScript + PixiJS 8 + Howler.js + Firebase 준비 구조 유지

## 개발 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

## 적용 권장

기존 누적 파일이 섞이지 않도록 `.git` 폴더만 남기고 전체 교체 ZIP을 압축 해제하는 방식을 권장합니다.


## v7.6.0 업데이트
- 하단 네비게이션이 모든 스크롤 화면과 낚시 화면에서 viewport fixed로 고정됩니다.
- 첨부된 v9 2.5D/3D 렌더드 PNG 에셋을 `public/assets/v9`로 선별 배치했고, UI/아이콘/장비/물고기/FX/배경 일부를 실제 런타임에 연결했습니다.
- SVG/벡터 느낌을 피하기 위해 v9 PNG/WebP 렌더드 에셋을 우선 사용합니다.

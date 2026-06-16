# AquaFantasia v1.0.5 Fishing Depth Visibility Polish

세로 전용 모바일 웹 낚시 게임 **AquaFantasia**의 v1.0.5 덮어쓰기용 패치입니다.

이번 패치는 새 메뉴 기능보다 **낚시 화면에서 배경이 캐릭터/찌/게이지/액션 이펙트를 묻어버리는 문제**를 잡는 데 집중했습니다.

## 핵심 변경

- 버전 체계 유지: `1.0.5`
- 기존 PixiJS 낚시 런타임과 DOM UI 유지
- WebGL 수중 레이어는 유지하되, 낚시 캐릭터/찌/게이지/액션 이펙트보다 앞에서 덮지 않도록 레이어 순서 재정리
- PixiJS 배경 스프라이트 투명도 조정
  - 수중 WebGL 배경은 살아나고
  - 캐릭터/찌/포획 이펙트는 더 선명하게 보이도록 조정
- 낚시 캐릭터 위치와 크기 조정
- 찌 위치를 더 잘 보이는 수면 쪽으로 조정
- 장력 게이지 크기/대비/안전구간 가독성 개선
- `낚시 시작`, 최근 포획, 콤보, 릴 패널 간격 재정리
- 배경은 게임 속 물 느낌이 나도록 WebGL 셰이더 개선
  - 카스틱 레이어 추가
  - 버블 밀도 증가
  - 빛줄기/플랑크톤/왜곡 강화
- 문서는 계속 `README.md` 하나만 유지
- `CLEAN_REPLACE_GUIDE`, `FINAL_CONSOLIDATED`, `PATCH_NOTES` 추가 생성 없음

## 적용 방법

기존 GitHub 프로젝트 루트에 ZIP 내용을 그대로 덮어쓴 뒤 실행합니다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 검증

이번 패치는 다음 명령 기준으로 검증됩니다.

```bash
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 메모

브라우저 정책상 일반 브라우저 전체화면은 사용자 터치 이후에만 시도됩니다. 카카오/인앱 브라우저에서는 화면 회전 문제를 피하기 위해 Fullscreen API를 직접 강제하지 않고, CSS 몰입형 세로 화면을 유지합니다.

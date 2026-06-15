# AquaFantasia v9.2.0 Cute Collection WebGL Polish

이번 패치는 v9.1의 WebGL 수중 레이어와 치비 캐릭터 방향을 유지하면서, 물고기/장비/상점/미션/아이콘/UI 프레임을 같은 2.5D 렌더드 톤으로 맞춘 비주얼 정리 패치입니다.

## 핵심 변경

- v9.2 렌더드 물고기 28종을 런타임 도감/포획/최근 포획에 연결
- 장비/가방/상점 아이템을 384px급 2.5D 아이템 에셋으로 교체
- 하단 네비, HUD, 패널, 미션 카드, 도감 카드, 버튼을 v9.2 렌더드 UI 프레임으로 재정리
- 메뉴/수역 배경을 v9.2 2.5D 배경에서 세로 1080x1920 WebP로 다시 생성
- 기존 PixiJS 낚시 런타임과 DOM UI는 유지
- WebGL 수중 레이어는 유지하고 배경/카스틱/버블 표현을 더 선명하게 조정
- 문서는 README.md 하나만 유지

## 검증

```bash
npm run validate
npm run typecheck
npm run build
npm run audit
```


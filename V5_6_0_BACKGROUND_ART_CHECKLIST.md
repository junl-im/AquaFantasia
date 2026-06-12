# v5.6.0 Background Art Checklist

## 적용 확인
- [ ] 마을에서 `호수` 선택 시 밝은 산/호수 배경이 보인다.
- [ ] `강` 선택 시 녹색 강변과 흐르는 수면 배경이 보인다.
- [ ] `항구` 선택 시 노을/선착장 분위기의 바다 배경이 보인다.
- [ ] `심해` 선택 시 어두운 수중 심해 배경이 보인다.
- [ ] `용궁` 선택 시 금빛 궁전 실루엣 배경이 보인다.
- [ ] `차원의 바다` 선택 시 보라색 차원/포털 분위기 배경이 보인다.

## 문제 재발 방지
- [ ] 낚시 화면 배경 안에 영어/한글 설명 텍스트가 보이지 않는다.
- [ ] `Pixi Bridge`, `Atlas 대기` 같은 개발용 오버레이가 낚시 배경 위에 계속 노출되지 않는다.
- [ ] 입질/릴 조작 UI는 기존처럼 정상 동작한다.
- [ ] PWA 캐시 갱신 후 이전 배경이 남지 않는다.

## 검증 명령
```bash
npm run validate
npm run runtime:check
npm run renderer:check
npm run audit
npm run atlas:check
npm run clean:report
```

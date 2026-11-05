# AquaFantasia V4 — 시각 자산 및 오픈소스 출처 검수표 (2026-10-30)

> **상태: 별도 브랜치의 시안만**. 정식 사이트 전환 승인 아님. 소스 파일이 리포지토리에 있다는 사실만으로 상업적 이용 권리가 검증되는 것은 아님.

## 실제 사용된 기술
- **PixiJS 8** (MIT) `https://github.com/pixijs/pixijs`: 이미 `package.json` dependency. V4에서 `Application, Assets, Container, Graphics, Sprite` 기반 Canvas/WebGL 장면에 실제 적용.
- `fishVisualSignal()`, `landingSignal()` (프로젝트 소스): 낚시 엔진의 실제 물리 상태를 읽어 2D 장면과 연동.
- 기존 V3 DOM: 조작/HUD/도감/항구. `?visual=1`로 시안 실행, 기본 V3는 유지.

## V4에서 재사용 중인 저장소 원화
| 상대 경로 (public 기준) | 시안에서의 역할 | 현재 권리 검증 |
|---|---|---|
| `assets/v101/water/water_clear_calm.webp` | 시작 해역 배경 | 출처 기록 미확인, 추후 재확인 |
| `assets/v101/water/water_coral_reef.webp` | 산호 해역 | 출처 기록 미확인 |
| `assets/v101/water/water_abyss_canyon.webp` | 심해 해역 | 출처 기록 미확인 |
| `assets/v12/bg/ocean_portrait.webp` | 수면 위 하늘/수평선 | 출처 기록 미확인 |
| `assets/v2110/objects/fishing_props/fishing_prop_001.png` | 전경 배 | 출처 기록 미확인 |
| `assets/v2110/character/fisher_walk_frames/fisher_direction_01_frame_01.png` | 낚시꾼 | 출처 기록 미확인 |
| `assets/v205/fishing/fish_shadow_common.png` | 배경의 먼 물고기 | 출처 기록 미확인 |
| `assets/art/fishing_float.png` | 낚시 찌 | 출처 기록 미확인 |
| `assets/v205/fishing/wave_splash.png` | 포획 물보라 | 출처 기록 미확인 |
| `assets/v2110/fish/**.png` | 도감/진행 중 물고기 | 출처 기록 미확인 |

**모든 재사용 이미지는 기존 저장소에서만 로드**, 제3자 소유라고 확인된 소스 무단 다운로드/이식은 하지 않았습니다. 소유권 문서가 확인되기 전 외부 배포용 신규 콘텐츠로 등록하지 말 것.

## 비교 조사했으나 현재 시안에 미이식
- Kenney Fish Pack CC0 `https://kenney.nl/assets/fish-pack`: 사용 가능한 PNG와 별도 라이선스 확인. 현재 사실적 물고기/입체 원화와 스타일이 불일치해 가져오지 않음.
- PixiJS Open Games MIT `https://github.com/pixijs/open-games`: 장면 및 프로덕션 구조 참고 후보. 코드 복사/리소스 이식 없음.
- Phaser MIT `https://github.com/phaserjs/phaser`: 대안 조사만 함. 엔진 2개 혼합 금지로 미이식.

## 시각 검수 통과 기준
- [ ] PNG/WebP 각 레이어가 실제 Pixi 캔버스에서 움직이는지 스크린샷/영상으로 확인
- [ ] 작은 화면 320×568와 390×844, 가로 화면, PC 1280×800에서 배·인물·줄·물고기·HUD가 잘리는지 확인
- [ ] 한국어 글꼴이 네모로 표시되지 않도록 QA 브라우저에 Noto CJK 설치
- [ ] 동작의 자연스러움, 스타일 일관성, 크기 대비, 화면 밀도는 **사람 눈으로 별도 평가**; CI PASS ≠ 비주얼 승인
- [ ] 이전 기능(도감 12종·장비·코인·저장) 회귀 보존
- [ ] SVG 자산/인라인 SVG 0개
- [ ] 최종 품질 평가 완료 전 기본 게임/정식 URL 교체 금지

## V4 모션 2차 시안 (2026-10-30)
- 낚시꾼: 저장소의 `v2110/character/fisher_walk_frames/fisher_direction_01_frame_01~04.png` 4개 실제 연속 프레임 사용. 사용자의 캐스팅·입질·누르고 릴 감기·놓기·포획 상태와 실시간 연동. 출처/권한의 원천 기록은 아직 확인되지 않았으며 기존 저장소 파일 범위 내에서만 시안 사용.
- 물고기: 12종의 기존 PNG 도감 원화를 PixiJS 8 `MeshPlane`로 휘게 하는 기능. 기존 PNG를 몸통·꼬리 결합 텍스처로 사용하여 프레임당 메시 정점만 변형. 스프라이트시트 12종을 새로 만들었다고 표현하지 않음.
- 낚싯줄: 고정 화면 좌표에서 캐릭터 낚싯대 머리의 상대 위치를 기준으로 이동. 추가 외부 자산 없음. 신규 SVG 없음.

## V4 물고기 국소 변형·장력 포즈 보정 (2026-10-30)
- **기존 원화만 사용:** 12종 물고기 PNG 및 낚시꾼 4프레임 그대로. 신규 그림·리깅 원화·외부 다운로드·SVG 없음.
- **메시 품질:** PixiJS `MeshPlane` 격자를 9×3에서 13×5로 조밀하게 변경. 좌우 몸통·꼬리 변형에 더해 위/아래 메시 정점에 다른 위상과 진폭의 국소 변형 적용. **실제 분리된 지느러미 스프라이트/본 리깅이 아니라 기존 이미지의 부분 왜곡**임을 명시.
- **종별 손맛:** `visualMotion.ts`에서 물고기 행동 6계열마다 변형 강도를 차등 처리하며, 낚시 엔진 `fightImpact()`와 장력 신호에서 진폭·속도·낚시꾼 노력 정도 산출. 화면에서 릴/버티기 전환 시 지수 감쇠 방식으로 캐릭터 회전·미세 상하 반응 완화. 절전 모드는 변형 0.
- **코드 범위:** `src/v3/visualMotion.ts`, `src/v3/visualScene.ts`, `tools/test-v3-fishing-engine.mjs`. 낚시 규칙·보상·도감·세이브 변경 없음. V4 실험 브랜치에서만 실행.
- **자동 QA:** [GitHub Actions #41035938629](https://github.com/junl-im/AquaFantasia/actions/runs/41035938629) 검증 성공, 정식 배포 생략. Node 테스트 54개, 빌드·타입 검사·Chromium 뷰포트/터치 통과. `aqua-v3-viewport-qa` PNG 캡처는 7일 보관.
- **추가 미검증:** 모바일 물리 기기, 스크린샷 사람 눈 검수, 실제 분리형 지느러미·손·낚싯대 관절 리깅, 이질적인 아트 스타일 통일. V4 초안 PR을 정식 병합하지 않음.

## V4 프로젝트 전용 신규 원화 — 낚싯대 (2026-11-05)
- **파일:** `public/assets/v4_original/fishing_rod_ocean_cel.png`, 투명 RGBA PNG 724×2172px.
- **제작 경위:** 사용자 AquaFantasia 게임 프로젝트용으로 OpenAI 이미지 생성 도구를 이용해 이 대화에서 새로 제작한 2.5D 수채/셀셰이딩 판타지 낚싯대 이미지. 외부 게임·오픈소스 팩에서 가져온 그림이 아님. 원본 프롬프트 주제: 청록 흑연 로드, 황동 릴, 코르크 손잡이, 독립 투명 배경.
- **적용 방식:** `src/v3/visualScene.ts`의 PixiJS `MeshPlane`(3×12 정점) 텍스처로 사용. 실제 줄 장력과 릴 입력을 읽어 상부 정점을 변형하고 찌/낚싯줄 기점이 메시 끝을 추적. PNG 로딩 실패 시 기존 단순 Canvas 그리기 폴백만 사용.
- **추적/제약:** 사용자 프로젝트 `junl-im/AquaFantasia`에 전용 등록. 생성 이미지이며 제3자 아트가 포함되었다는 소유권·완전 독창성·독점권 법적 보증은 하지 않음. 다른 기존 PNG의 권리 검수는 별개 미완료. 새 SVG 없음.
- **출시 상태:** `visual-rebuild-v4` / Draft PR #4에서만 검수. 사용자의 전체 그림체·원근감 및 모바일 시각 승인 이전에는 공개 V3를 대체하지 않음.

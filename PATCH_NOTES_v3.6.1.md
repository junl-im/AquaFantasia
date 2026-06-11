# AquaFantasia Patch v3.6.1 Core Navigator Hotfix

## 수정
- 첫 시작 시 `게임 초기화 중 오류가 발생했습니다`가 뜨던 문제 수정
- 원인: v3.2~v3.4 패널 일부에서 이전 변수명 `FISH_DB`를 참조했으나 현재 런타임 데이터베이스 이름은 `FISH_DATABASE`였음
- 조치: 모든 `FISH_DB` 참조를 `FISH_DATABASE`로 교체
- 초기화 오류 메시지에 실제 오류명을 포함하도록 보강
- 저장 키 `aqua_v3.6.1` 추가, 기존 v3.6 이하 데이터 호환 유지

## 검증
- npm run validate 통과
- npm run audit 통과
- 런타임 모의 초기화에서 init 통과 확인

# v3.6.2 Performance Test Checklist

## 모바일

- 카카오톡 링크로 접속했을 때 외부 브라우저 안내 팝업 없이 실행된다.
- 첫 화면에서 2~3초 안에 조작 가능하다.
- 마을 화면 스크롤 시 큰 끊김이 없다.
- 낚시 화면 진입 후 물고기 그림자가 과하게 많지 않다.
- 뒤로가기 종료 확인창이 정상 표시된다.

## 캐시

- GitHub Actions에서 `npm run validate`가 통과한다.
- GitHub Actions에서 `npm run audit`가 통과한다.
- Service Worker 캐시 이름이 `aqua-fantasia-v3.6.2`이다.
- 이전 v3.6.1 캐시가 남아 있을 경우 새로고침 후 v3.6.2로 교체된다.

## 저장

- 포획 후 새로고침해도 데이터가 유지된다.
- 판매 후 골드/가방 상태가 유지된다.
- localStorage에 `aqua_v3.6.2`, `aqua_v3.6.1`, `aqua_latest_state`가 생성된다.

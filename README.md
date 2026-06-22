# @fan MVP

인스타그램 ID 기반 선후원 팬덤 플랫폼 MVP입니다. `refer/` 자료의 기조를 기준으로 팬 검색, 후원 예치, 전용 피드, 1:1 채팅, 아티스트 수락/거절, 정산/환불 상태를 정적 웹앱으로 구현했습니다.

## 로컬 실행

서버 없이 `index.html`을 브라우저로 열 수 있습니다.

정적 서버로 확인하려면:

```sh
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## Docker 실행

정적 파일을 nginx 컨테이너로 서빙합니다.

```sh
docker network create proxy
cp .env.example .env
docker compose up -d --build
```

컨테이너는 외부 Docker network인 `proxy`에 붙습니다. 기본 포트는 `18080`입니다. 변경하려면 `.env`에서 `AT_FAN_PORT`를 수정합니다.

## 운영 문서

- [출시 전 고려사항](docs/LEGAL_AND_OPERATIONS.md)

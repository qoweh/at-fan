# @fan MVP

인스타그램 ID 기반 선후원 팬덤 플랫폼 MVP입니다. `refer/` 자료의 기조를 기준으로 팬 검색, 후원 예치, 전용 피드, 1:1 채팅, 아티스트 수락/거절, 정산/환불 상태를 정적 웹앱으로 구현했습니다.

## 로컬 실행

서버 없이 `index.html`을 브라우저로 열 수 있습니다.

정적 서버로 확인하려면:

```sh
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 홈서버 배포

이 repo의 `main` 브랜치를 원본 소스로 보고 홈서버에서 pull 후 Docker로 재기동하는 방식입니다. 외부 HTTPS와 도메인 라우팅은 Nginx Proxy Manager에서 처리하고, 이 컨테이너는 기본 nginx 이미지로 정적 파일만 서빙합니다.

```sh
cp .env.example .env
docker compose up -d --build
```

기본 포트는 `18080`입니다. Nginx Proxy Manager에서 이 포트로 프록시하면 됩니다. 변경하려면 `.env`에서 `AT_FAN_PORT`를 수정합니다.

서버에서 직접 배포하려면:

```sh
APP_DIR="$HOME/service/apps/at-fan" sh scripts/deploy-home-server.sh
```

## GitHub Actions 배포

현재 홈서버의 기존 runner는 `qoweh/home-server` repo에 붙어 있습니다. 따라서 `qoweh/at-fan` repo의 workflow가 그 runner를 직접 사용할 수 없습니다.

권장 배포 방식은 SSH 접속이 아니라 `qoweh/at-fan` repo의 workflow가 `qoweh/home-server` repo에 `repository_dispatch` 이벤트를 보내고, `qoweh/home-server` repo의 기존 self-hosted runner가 `/home/pilt/service/apps/at-fan`을 갱신한 뒤 `docker compose`를 실행하는 것입니다.

필요한 설정:

- `qoweh/at-fan` repo secret: `HOME_SERVER_DISPATCH_TOKEN`
- `qoweh/home-server` repo workflow: `.github/workflows/at-fan-deploy.yml`

`HOME_SERVER_DISPATCH_TOKEN`은 `qoweh/home-server` repo에 `repository_dispatch`를 만들 수 있는 GitHub token입니다. 예시는 [홈서버 배포 메모](docs/HOME_SERVER_DEPLOYMENT.md)에 정리했습니다.

기본 배포 경로:

- `/home/pilt/service/apps/at-fan`

서버 요구사항:

- `git`
- Docker Engine
- Docker Compose plugin
- runner 실행 계정의 `/home/pilt/service/apps` 쓰기 권한
- runner 실행 계정의 Docker 실행 권한

`qoweh/at-fan` repo가 private이면 홈서버 runner 실행 계정에 `git@github.com:qoweh/at-fan.git` clone 권한이 필요합니다.

## 운영 문서

- [출시 전 고려사항](docs/LEGAL_AND_OPERATIONS.md)
- [홈서버 배포 메모](docs/HOME_SERVER_DEPLOYMENT.md)

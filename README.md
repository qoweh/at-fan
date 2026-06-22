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

이 repo의 `main` 브랜치를 원본 소스로 보고 홈서버에서 pull 후 Docker로 재기동하는 방식입니다.

```sh
cp .env.example .env
docker compose up -d --build
```

기본 포트는 `8080`입니다. 변경하려면 `.env`에서 `AT_FAN_PORT`를 수정합니다.

서버에서 직접 배포하려면:

```sh
APP_DIR="$HOME/apps/at-fan" sh scripts/deploy-home-server.sh
```

## GitHub Actions 배포

`main`에 push되면 `.github/workflows/deploy-home-server.yml`이 홈서버에 SSH 접속해 repo를 `git pull --ff-only`로 갱신하고 `docker compose up -d --build`를 실행합니다.

필요한 GitHub Secrets:

- `HOME_SERVER_HOST`
- `HOME_SERVER_USER`
- `HOME_SERVER_SSH_KEY`
- `HOME_SERVER_SSH_PORT` optional, 기본 `22`
- `HOME_SERVER_APP_DIR` optional, 기본 `$HOME/apps/at-fan`

서버 요구사항:

- `git`
- Docker Engine
- Docker Compose plugin

repo가 private이면 홈서버에 deploy key 또는 GitHub token 기반 clone 권한이 필요합니다.

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

`main`에 push되면 `.github/workflows/deploy-home-server.yml`이 홈서버의 GitHub self-hosted runner에서 실행됩니다. runner가 `/home/pilt/service/apps/at-fan`에 repo를 clone하거나 `git pull --ff-only`로 갱신한 뒤 `docker compose up -d --build`를 실행합니다. workflow 안에서는 `GITHUB_TOKEN`으로 현재 repo를 읽기 때문에 별도 SSH secret은 필요 없습니다.

기존 runner가 GitHub repo 설정에 등록되어 있고 online이면 새 runner를 추가할 필요가 없습니다. runner가 여러 대라면 workflow의 `runs-on`에 서버 전용 label을 추가하세요.

기본 배포 경로:

- `/home/pilt/service/apps/at-fan`

서버 요구사항:

- `git`
- Docker Engine
- Docker Compose plugin
- runner 실행 계정의 `/home/pilt/service/apps` 쓰기 권한
- runner 실행 계정의 Docker 실행 권한

서버에서 `scripts/deploy-home-server.sh`를 직접 실행할 때 repo가 private이면 홈서버에 deploy key 또는 GitHub token 기반 clone 권한이 필요합니다.

## 운영 문서

- [출시 전 고려사항](docs/LEGAL_AND_OPERATIONS.md)
- [홈서버 배포 메모](docs/HOME_SERVER_DEPLOYMENT.md)

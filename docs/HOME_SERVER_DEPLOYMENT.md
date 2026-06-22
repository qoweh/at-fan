# 홈서버 배포 메모

대상 환경:

- Ubuntu 22 LTS
- Intel CPU, 일반적으로 `linux/amd64`
- Portainer로 compose stack 관리
- Nginx Proxy Manager로 도메인/HTTPS/reverse proxy 관리
- GitHub self-hosted runner로 repo pull/deploy 가능

## 현재 권장 구조

```text
Internet
  -> Nginx Proxy Manager
      -> at-fan-web container :80
```

이 repo의 앱 컨테이너는 기본 nginx 이미지로 정적 파일만 서빙합니다. 별도 `nginx.conf`는 두지 않습니다. 외부 도메인, SSL, HTTP/2, HSTS, 프록시 룰은 Nginx Proxy Manager에서 관리합니다.

홈서버의 소스 배포 경로는 다음을 기본으로 둡니다.

```text
/home/pilt/service/apps/at-fan
```

`/home/pilt/service/apps` 아래에 이미 `code-server`, `pingpong` 같은 서비스 디렉토리가 있으므로 `at-fan`도 같은 레벨에 둡니다.

## GitHub Actions runner 배포

`.github/workflows/deploy-home-server.yml`은 SSH 접속 방식이 아니라 GitHub self-hosted runner 방식입니다. 기존에 추가한 runner가 repo에서 online 상태라면 그대로 활용할 수 있습니다.

동작 순서:

1. `/home/pilt/service/apps` 생성
2. `/home/pilt/service/apps/at-fan`이 없으면 `GITHUB_TOKEN`으로 `git clone`
3. 이미 있으면 `git fetch`, `git checkout main`, `git pull --ff-only`
4. `docker compose up -d --build`

runner 요구사항:

- runner가 `qoweh-server`에서 실행 중일 것
- runner 실행 계정이 `/home/pilt/service/apps`에 쓸 수 있을 것
- runner 실행 계정이 Docker를 실행할 수 있을 것
- 서버에 `git`, Docker Engine, Docker Compose plugin이 설치되어 있을 것

workflow는 현재 repo 읽기에 `GITHUB_TOKEN`을 사용하고, clone 후 remote URL에는 토큰을 저장하지 않습니다. 따라서 GitHub Secrets에 서버 SSH key를 넣지 않아도 됩니다.

runner가 여러 대라면 workflow의 `runs-on`을 서버 전용 label로 좁힙니다.

```yaml
runs-on: [self-hosted, linux, qoweh-server]
```

현재는 가장 호환성 높은 값인 `self-hosted`만 사용합니다.

## Nginx Proxy Manager와 직접 nginx 설정의 차이

Nginx Proxy Manager:

- 웹 UI로 Proxy Host, SSL, Let's Encrypt 인증서 관리
- nginx 설정 파일을 직접 작성하지 않아도 됨
- 홈서버에서 여러 서비스를 도메인별로 연결하기 쉬움
- Access List, Force SSL, HTTP/2, WebSocket 프록시 같은 기본 옵션을 UI로 켤 수 있음
- 단점: 고급 nginx 튜닝, 복잡한 location rule, 세밀한 캐시/헤더/보안 정책은 직접 nginx보다 제한적임
- NPM 자체 데이터베이스와 설정 백업이 중요함

직접 nginx:

- 정적 파일 서빙, reverse proxy, load balancing, caching, header/security 설정을 텍스트 config로 정밀 제어
- Git으로 nginx 설정을 엄격하게 관리하기 좋음
- 대규모 트래픽, 복잡한 라우팅, 정교한 캐시 전략에 유리
- 단점: 인증서 자동화, reload, 설정 오류 대응을 직접 운영해야 함

현재 @fan MVP는 NPM이 더 적합합니다. 앱은 단순 정적 컨테이너이고, 복잡한 nginx 설정이 필요 없습니다.

## Portainer Stack 설정

Portainer에서:

1. Stacks > Add stack
2. Repository 선택
3. Repository URL: `https://github.com/qoweh/at-fan.git`
4. Repository reference: `refs/heads/main`
5. Compose path: `docker-compose.yml`
6. Environment variable:
   - `AT_FAN_PORT=18080`
7. Deploy

Nginx Proxy Manager에서:

- Domain Names: 원하는 도메인
- Scheme: `http`
- Forward Hostname / IP: 홈서버 IP 또는 Docker 네트워크에서 접근 가능한 서비스명
- Forward Port: `18080`
- SSL: Let's Encrypt 발급
- Force SSL: 켬
- HTTP/2: 켬
- Websockets Support: 현재 정적 MVP는 불필요, 향후 실시간 채팅 서버를 붙이면 켬

## 내부 Docker 네트워크 옵션

가장 단순한 방식은 `AT_FAN_PORT=18080`으로 호스트 포트를 열고 NPM이 `host-ip:18080`으로 프록시하는 것입니다.

조금 더 깔끔한 방식은 NPM과 앱 stack을 같은 Docker network에 붙이고, NPM에서 `at-fan-web:80`으로 프록시하는 것입니다. 이 경우 compose에 external network를 추가해야 합니다. 홈서버의 NPM 네트워크 이름을 확인한 뒤 적용합니다.

예시:

```yaml
services:
  at-fan:
    build:
      context: .
    container_name: at-fan-web
    restart: unless-stopped
    expose:
      - "80"
    networks:
      - npm-proxy

networks:
  npm-proxy:
    external: true
```

## Intel CPU 관련

현재 `nginx:1.27-alpine` 이미지는 amd64를 지원하므로 Intel Ubuntu 서버에서 별도 설정 없이 동작합니다. 향후 직접 이미지를 빌드해 GitHub Container Registry에 올릴 경우 `linux/amd64` 대상으로 빌드하면 됩니다.

## 동적 서버가 생기면

실제 결제/채팅/인증이 들어가면 구조가 바뀝니다.

```text
NPM
  /      -> frontend container
  /api   -> api container
  /ws    -> api websocket

api
  -> postgres
  -> redis
  -> pg webhook
```

그때 필요한 compose 서비스:

- `frontend`
- `api`
- `postgres`
- `redis`
- 선택: `worker`

그때는 NPM에서 WebSocket support를 켜고, `/api`, `/ws` 프록시 라우팅을 분리해야 합니다.

## 참고 자료

- Nginx Proxy Manager Guide  
  https://nginxproxymanager.com/guide/
- Nginx Proxy Manager Setup  
  https://nginxproxymanager.com/setup/
- NGINX 정적 콘텐츠 서빙 문서  
  https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/
- Portainer Stack 추가 문서  
  https://docs.portainer.io/user/docker/stacks/add
- Portainer Git repo stack 편집 정책  
  https://docs.portainer.io/user/docker/stacks/edit
- Docker Compose plugin 설치  
  https://docs.docker.com/compose/install/linux/
- Docker Engine Ubuntu 설치  
  https://docs.docker.com/engine/install/ubuntu/

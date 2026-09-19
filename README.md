# stock5-8

비밀번호(기본 `1222`)로 보호되는 관심종목 차트입니다. 종목·순서·카테고리·100자 메모와 메모 위치가 저장됩니다.

## 저장소 설정

- Oracle 배포: `STOCK5_DATA_DIR`을 영속 볼륨 경로로 지정합니다. KIS 키가 있으면 기존 실시간 KIS REST/WebSocket 경로를 사용합니다.
- Vercel 배포: Vercel KV를 연결하고 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 환경변수를 설정합니다. 그래야 서로 다른 기기와 재배포 뒤에도 동일한 관심종목 목록을 봅니다. Vercel에서는 네이버/Yahoo 공개 소스로 폴링합니다.
- `STOCK5_PASSWORD`는 배포 환경변수에서 변경할 수 있습니다. 기본값은 사용자 요청값인 `1222`입니다.

`KRX`는 정규장 기준, `KRX 장후`는 장후 표시 모드입니다. 장후 KRX 분봉 제공 범위는 데이터 제공처가 지원하는 시간까지 표시됩니다.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

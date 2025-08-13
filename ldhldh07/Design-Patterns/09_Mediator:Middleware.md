# Mediator/Middleware

여러 객체가 요청/이벤트를 주고받을 때 중간에 위치해서 해당 요청들을 총괄하여 처리하는 패턴을 의미한다



## 장점 

결합도가 낮다

- 다른 컴포넌트들은 서로에 대해 몰라도 된다. 미들웨어를 제거하거나 추가, 수정하면 다른 코드는 수정할 필요가 없다

로직의 중앙화

- 로깅, 인증 가드, 캐시 저장 등 같은 맥락에서 이루어지는 공통 로직을 한 곳에서 관리할 수 있다

테스트 용이성

- 각 미들웨어를 단위 테스트로 독립 검증 가능

관측성 향상

- 전/후처리 훅 구조라 추적이 쉬움(요청 한 번에 어떤 단계들 통과했는지 로깅/트레이싱하기 좋음).

확장 용이

- 기능이 늘어나도 순서만 관리하면 스케일업 가능. 새 요구사항은 새 미들웨어로 추가.



### Mediator vs Middleware

| **구분**       | **Mediator**                                | **Middleware**                                         |
| -------------- | ------------------------------------------- | ------------------------------------------------------ |
| 문제 형태      | 여러 컴포넌트/모듈 간 상호작용 조정         | 하나의 요청/이벤트를 단계별 가공                       |
| 토폴로지       | 허브–스포크 (N ↔ 1 ↔ N)                     | 직렬 파이프라인 (1 → N)                                |
| 흐름 제어      | 이벤트 라우팅/브로드캐스트                  | next()로 전/후처리, 단락 가능                          |
| 상태 보유      | (있을 수 있음) 규칙/상태를 중재자에 캡슐화  | 보통 무상태(컨텍스트만 전달/수정)                      |
| 결합 완화 대상 | 컴포넌트 ↔ 컴포넌트                         | 핸들러 ↔ 횡단 관심사                                   |
| 예시           | Flux 디스패처, Event Bus(mitt), XState 머신 | Redux 미들웨어, Axios 인터셉터, 라우터 가드, Next Edge |
| 테스트 포인트  | 중재 규칙이 기대대로 **라우팅**되는가       | 단계별 전/후 조건과 단락이 맞는가                      |
| 경우           | “버튼 A가 눌리면 B와 C가 서로 모른 채 반응” | “요청을 인증→로그→캐시→핸들러로 깎아라”                |



### Next.js

```ts
import { NextResponse, NextRequest } from "next/server";

// 지원 로케일 목록
const SUPPORTED = ["ko", "en"] as const;
type Locale = (typeof SUPPORTED)[number];

function detectLocale(req: NextRequest): Locale {
  // 1) 쿠키 우선
  const cookie = req.cookies.get("LOCALE")?.value as Locale | undefined;
  if (cookie && SUPPORTED.includes(cookie)) return cookie;

  // 2) Accept-Language 헤더
  const header = req.headers.get("accept-language") ?? "";
  const match = SUPPORTED.find((l) => header.startsWith(l));
  return match ?? "en";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 정적 파일/이미지 등은 패스
  if (/\.(ico|png|jpg|jpeg|gif|svg|css|js|map|txt)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 1) 인증 가드 (대시보드 보호)
  if (pathname.startsWith("/dashboard")) {
    const session = req.cookies.get("SESSION")?.value;
    if (!session) {
      const login = new URL("/login", req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  // 2) i18n 프리픽스가 없으면 로케일에 맞게 rewrite
  const hasLocalePrefix = SUPPORTED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocalePrefix) {
    const locale = detectLocale(req);
    const url = new URL(`/${locale}${pathname}`, req.url);
    const res = NextResponse.rewrite(url);
    // 최초 접근 시 쿠키 심어두기(30일)
    res.cookies.set("LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  // 3) 간단한 A/B 테스트 (쿠키 없으면 무작위 배정)
  if (pathname.startsWith("/ko") || pathname.startsWith("/en")) {
    let bucket = req.cookies.get("AB")?.value;
    if (!bucket) {
      bucket = Math.random() < 0.5 ? "A" : "B";
      const res = NextResponse.next();
      res.cookies.set("AB", bucket, { path: "/", maxAge: 60 * 60 * 24 * 7 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  // 매칭 경로 (API 라우트 포함 제외하고 싶으면 수정)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Next.js에서 권장하는 middleware 파일 형식으로

이 프로젝트에서 라우팅 요청시 중간에서 이를 관리해주는 기능을 수행한다.



라우팅 중간에서 정보를 통해 인증 가드, 리다이렉트 등의 판단을 수행한 후 `NextResponse.next()`를 통해 원래 요청된 내용대로 다시 동작한다.
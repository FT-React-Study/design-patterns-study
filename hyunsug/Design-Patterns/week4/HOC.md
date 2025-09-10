# [HOC 패턴](https://patterns-dev-kr.github.io/design-patterns/hoc-pattern/)

## 정의

- 컴포넌트를 인수로 받아 새로운 컴포넌트를 반환하여 로직을 재사용하는 패턴
- 서브클래싱이 아닌 합성을 통해 횡단 관심사(cross-cutting concerns)를 주입

## 특징

- 입력: `WrappedComponent`, 출력: `EnhancedComponent`
- 렌더링 결과는 그대로 위임하고, 부가 로직(데이터 주입, 권한, 로깅 등)만 추가
- 여러 HOC를 조합해 기능을 점진적으로 확장 가능

## 시그니처 (TypeScript)

```tsx
import type { ComponentType } from "react";

type HOC<WrappedProps, InjectedProps = WrappedProps> = (
  Wrapped: ComponentType<WrappedProps>
) => ComponentType<InjectedProps>;
```

## 기본 예시: 인증 권한 확인 HOC

```tsx
import React, { ComponentType, ReactNode } from "react";

type User = { id: string; name: string; role: string };

type RequireAuthProps = {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
};

function RequireAuth({ children, requiredRoles, fallback }: RequireAuthProps) {
  // 실제로는 useContext나 상태 관리 라이브러리에서 가져옴
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback || <div>로그인이 필요합니다.</div>;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return fallback || <div>권한이 부족합니다.</div>;
  }

  return <>{children}</>;
}

// HOC 형태로도 제공
function requireAuth<P>(Wrapped: ComponentType<P>, requiredRoles?: string[]) {
  const ComponentWithAuth = (props: P) => (
    <RequireAuth requiredRoles={requiredRoles}>
      <Wrapped {...props} />
    </RequireAuth>
  );

  ComponentWithAuth.displayName = `requireAuth(${
    Wrapped.displayName || Wrapped.name || "Component"
  })`;
  return ComponentWithAuth;
}

// 사용 - children 패턴
// <RequireAuth requiredRoles={['admin']}>
//   <AdminPanel />
// </RequireAuth>

// 사용 - HOC 패턴
// const AdminPanelWithAuth = requireAuth(AdminPanel, ['admin']);
```

## 공통 이슈와 해결

- displayName 설정: 디버깅/React DevTools 가독성 개선
- 정적 메서드 복사: `hoist-non-react-statics` 사용 필요
- ref 전달: `React.forwardRef`와 함께 사용해 ref 투명성 확보

```tsx
import hoistNonReactStatics from "hoist-non-react-statics";

function withFeature<P>(Wrapped: React.ComponentType<P>) {
  const Enhanced = (props: P) => <Wrapped {...props} />;
  hoistNonReactStatics(Enhanced, Wrapped);
  Enhanced.displayName = `withFeature(${
    Wrapped.displayName || Wrapped.name || "Component"
  })`;
  return Enhanced;
}
```

## 장단점

- 장점
  - 관심사 분리: UI와 비 UI 로직 분리 용이
  - 조합성: 여러 HOC를 합성해 점진적 기능 확장
- 단점
  - Wrapper Hell: 중첩이 깊어지면 트리 가독성 저하
  - 명시적 의존성 약화: 주입되는 props 추적이 어려울 수 있음

## Render Props / Hooks와 비교

- Render Props: 유연하지만 트리 깊어짐, props 함수로 전달
- Hooks: 가장 현대적/간결한 로직 재사용, 클래스 필요 없음
- HOC: 기존 클래스/함수 컴포넌트 모두 적용 가능, 라이브러리 확장에 유리

## 언제 쓰면 좋은가

- 외부 라이브러리 확장 시 API 표면을 최소 변경으로 감싸고 싶을 때
- 권한, 로깅, 성능 측정 등 횡단 관심사를 여러 컴포넌트에 일괄 주입할 때

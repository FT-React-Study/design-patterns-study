# HOC 패턴이란?

 Higher Order Component (고차 컴포넌트) 패턴은 *컴포넌트*를 인자로 받아 *새로운 컴포넌트*를 반환하는 방식의 리액트 디자인 패턴입니다. 여기서 컴포넌트는 함수형 뿐만 아니라 클래스형 컴포넌트도 포함입니다. HOC 의 특징은 Wrapper 함수가 JSX 를 리턴하는 것이 아니라 *JSX 를 리턴하는 함수*를 리턴하는 것 입니다.

# 왜 사용하나요?

 HOC 는 같은 로직을 여러 컴포넌트에서 재사용 하는 방법 중 하나입니다. HOC 를 통해 공통된 스타일을 한번에 적용시키거나, 백엔드 fetch 후 데이터 적용, 로깅 등 공통 로직을 인자로 들어온 컴포넌트에 적용할 수 있습니다. 또한, *Wrapper 함수가 인자로 들어온 컴포넌트의 props 를 가로채 변형 할 수 있습니다.*

# 활용

```tsx
export function withAuth<P extends object>(Wrapped: React.ComponentType<P>) {
  const withAuthHOC: React.FC<P> = (props) => {
    console.log("authenticated!");
    console.log(props);
    return <Wrapped {...props} />;
  };
  return withAuthHOC;
}
```

```tsx
import { withAuth } from "../../shared";

type ProfileProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

function Profile({ user }: ProfileProps) {
  return (
    <div>
      <h2>Profile</h2>
      <p>This is the profile component.</p>
      <p>User ID: {user.id}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

export const AuthenticatedProfile = withAuth(Profile);
```

```tsx
export function withLoader<P extends object>(Wrapped: React.ComponentType<P>) {
  const withLoaderHOC: React.FC<P> = (props) => {
    console.log("Loading...");
    console.log(props);
    return <Wrapped {...props} loaded={true} />;
  };
  return withLoaderHOC;
}

/////////////

import { withAuth, withLoader } from "../../shared";

type ProfileProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

function Profile({ user }: ProfileProps) {
  return (
    <div>
      <h2>Profile</h2>
      <p>This is the profile component.</p>
      <p>User ID: {user.id}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

export const AuthenticatedProfile = withLoader(withAuth(Profile));
```

## Hooks 는 대체 할 수 없는 부분

 HOC 는 공통된 로직 재사용이라는 점에서 커스텀 훅을 만들어 사용하는 것과 목적에 유사한 점이 많고, 실제로 많은 부분에서 커스텀 훅으로 대체 되었습니다. 하지만, HOC 가 아직도 남아있는 것은 커스텀 훅이 HOC를 완전히 대체 할 수는 없기 때문입니다. 디자인 패턴 적으로도 차이가 있지만, 기능적으로 차이가 많이 납니다. 구현상 완전 반대 상황이기 때문이죠.

![HOC 는 공통 로직을 사용 컴포넌트의 외부에서 제공하기 때문에 사용 컴포넌트는 공통 로직을 접근, 사용 할 수 없습니다. 하지만 커스텀 훅 같은 경우에는 사용 컴포넌트의 내부 상태나 props 를 커스텀 훅에 제공해 그 로직에 따른 결과값을 리턴 받아 직접 사용합니다.](attachment:49242b4c-3a9e-4c7a-a304-2a08a2ed3e39:image.png)

HOC 는 공통 로직을 사용 컴포넌트의 외부에서 제공하기 때문에 사용 컴포넌트는 공통 로직을 접근, 사용 할 수 없습니다. 하지만 커스텀 훅 같은 경우에는 사용 컴포넌트의 내부 상태나 props 를 커스텀 훅에 제공해 그 로직에 따른 결과값을 리턴 받아 직접 사용합니다.

- 인자로 들어오는 컴포넌트의 props 에 접근해 수정 할 수 있음
- 공통 로직이 어떤 컴포넌트의 상태나 props 에도 변하지 않는다면, 이를 안전하게 격리할 수 있음

## 단점

### Wrapper Hell

 너무 많은 공통 로직이 존재한다면, 콜백 지옥 처럼 너무 많은 HOC 들이 존재할 수 있습니다. 이는, 라이브러리를 통해 좀 더 가독성이 좋게 하거나 할 수 있다고 합니다.

### 타입스크립트에서 불편

 HOC 는 어떤 인자가 컴포넌트로 들어오던 props 에 대해 대응해야 하기 때문에, 타입 선언이 상당히 어렵습니다. (예시 코드도 사실 거의 `any` 나 다름 없게 작성이 되어있는 셈이죠.)

### 정적 프로퍼티로 추가된 props 는 누락됨

 HOC 에서 props 를 사용할 때, 간혹 정적 프로퍼티 형태로 props 가 추가된 컴포넌트가 있을 수 있습니다. 이때, 정적 prop 은 런타임에서 추가되는 것이기 때문에 누락 될 수 있습니다.

```tsx
type DialogProps = { children: React.ReactNode };

function Dialog({ children }: DialogProps) {
  return <div className="dialog">{children}</div>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1>{children}</h1>;
}

function Content({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// 정적 프로퍼티 추가
Dialog.Title = Title;
Dialog.Content = Content;

// 사용예시
<Dialog>
  <Dialog.Title>알림</Dialog.Title>
  <Dialog.Content>내용입니다</Dialog.Content>
</Dialog>
```

---

[HOC 패턴](https://patterns-dev-kr.github.io/design-patterns/hoc-pattern/)
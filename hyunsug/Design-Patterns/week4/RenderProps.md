# [Render Props 패턴](https://patterns-dev-kr.github.io/design-patterns/render-props-pattern/)

## 정의

- 자식으로 함수를 전달받아(render prop) 내부 상태/행동을 외부에서 그리는 패턴
- UI는 호출자에 위임하고, 컨테이너는 데이터/행동만 제공

## Presenter/Container 패턴과의 관계

Render Props는 Container/Presenter 패턴을 React에서 구현하는 대표적인 방법입니다.

```tsx
// Container: 데이터와 로직만 담당
function UserDataContainer({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  };

  // Presenter에게 데이터와 행동을 전달
  return children({ users, loading, fetchUsers });
}

// Presenter: UI 표현만 담당
function UserListPresenter({ users, loading, onRefresh }) {
  return (
    <div>
      <button onClick={onRefresh}>Refresh</button>
      {loading ? <Spinner /> : <UserList users={users} />}
    </div>
  );
}

// 사용 - Container와 Presenter 분리
<UserDataContainer>
  {(containerProps) => <UserListPresenter {...containerProps} />}
</UserDataContainer>;
```

핵심 원칙:

- Container: 상태 관리, 비즈니스 로직, 데이터 fetching
- Presenter: 순수한 UI 렌더링, props만을 기반으로 동작

## Composition과의 차이점

### 일반적인 Composition (정적 구성)

```tsx
// children을 단순히 배치하는 방식
function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// 사용
<Layout>
  <UserProfile user={user} />
</Layout>;
```

### Render Props (동적 구성)

```tsx
// children에게 데이터를 전달하여 동적으로 구성
function DataProvider({ children }) {
  const [data, setData] = useState();

  return children({ data, setData });
}

// 사용 - 데이터를 받아서 동적으로 UI 구성
<DataProvider>
  {({ data, setData }) => <UserProfile user={data} onUpdate={setData} />}
</DataProvider>;
```

주요 차이점:

- Composition: 미리 정의된 컴포넌트들을 조립
- Render Props: 런타임에 데이터를 기반으로 UI를 생성

## 다양한 Prop 타입들과 실행 방식

### 1. `React.ReactNode` - 가장 유연한 타입

```tsx
type Props = {
  children: React.ReactNode;
};

// 모든 것을 받을 수 있음: JSX, 문자열, 숫자, 배열 등
<Component>Hello World</Component>
<Component>{42}</Component>
<Component>{[<div key="1">A</div>, <div key="2">B</div>]}</Component>
```

### 2. `React.ReactElement` - JSX 엘리먼트만

```tsx
type Props = {
  element: React.ReactElement;
};

// JSX 표현식만 허용
<Component element={<UserProfile />} />;
// <Component element="text" /> // ❌ 타입 에러
```

### 3. `() => React.ReactElement` - 지연 실행 함수

```tsx
type Props = {
  renderContent: () => React.ReactElement;
};

function Component({ renderContent }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && renderContent()} // 조건부로 실행
    </div>
  );
}
```

### 함수 실행 방식의 차이와 Fiber 아키텍처

#### 방식 1: 직접 함수 실행

```tsx
function Container({ renderChild }) {
  const data = useData();
  return <>{renderChild(data)}</>;
}

// renderChild()는 즉시 실행되어 ReactElement 반환
// Fiber는 반환된 element를 직접 처리
```

#### 방식 2: 컴포넌트로 래핑

```tsx
function Container({ createComponent }) {
  const data = useData();
  const ChildComponent = createComponent(data);
  return <ChildComponent />;
}

// createComponent()가 실행되어 컴포넌트 함수 반환
// <ChildComponent />로 새로운 Fiber 노드 생성
```

### React Fiber와 Hooks 순서 보장

React Fiber 아키텍처에서는 각 컴포넌트 인스턴스마다 hooks 배열을 유지합니다:

```tsx
// 방식 1: 직접 실행 - hooks가 부모 컴포넌트에 속함
function Parent({ renderChild }) {
  const [state] = useState(); // Parent의 hooks[0]

  return renderChild(); // renderChild 내부의 hooks는 Parent에 속함
}

// 방식 2: 컴포넌트 래핑 - 새로운 Fiber 노드와 hooks 배열 생성
function Parent({ createChild }) {
  const [state] = useState(); // Parent의 hooks[0]

  const Child = createChild();
  return <Child />; // Child는 독립된 Fiber 노드와 hooks 배열을 가짐
}
```

Fiber의 hooks 순서 보장 메커니즘:

- 각 Fiber 노드는 `memoizedState` 링크드 리스트로 hooks 상태 저장
- hooks 호출 순서는 컴포넌트 렌더링 시마다 동일해야 함
- 방식 2가 더 안전한 이유: 독립된 컴포넌트 스코프에서 hooks 실행

## 특징

- 입력: 함수 형태의 children 혹은 `render` prop
- 출력: 호출자가 반환한 ReactNode
- 로직과 표현 분리, 재사용성/유연성 높음

## 기본 예시: 데이터 패처

```tsx
import React, { useEffect, useState } from "react";

type DataFetcherProps<T> = {
  url: string;
  children: (state: {
    data: T | null;
    loading: boolean;
    error: Error | null;
  }) => React.ReactNode;
};

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [url]);

  return <>{children({ data, loading, error })}</>;
}

// 사용
// <DataFetcher url="/api/users">{({ data, loading }) => loading ? '...' : <UserList users={data} />}</DataFetcher>
```

## 공통 이슈와 해결

- 중첩 지옥: 여러 Render Props 중첩 시 읽기 어려움 → 컴포지션/추상화로 완화
- 리렌더링: 함수 새로 생성으로 인한 리렌더링 → 메모이제이션/분리
- 타입: 함수 children 시그니처를 명확히 정의

## 장단점

- 장점
  - 표현 완전 위임으로 최고 수준의 유연성
  - 조합 용이: 다양한 호출자에서 원하는 UI로 구성
- 단점
  - 중첩 렌더링으로 가독성 저하
  - 불필요 리렌더 가능성

## HOC / Hooks와 비교

- HOC: 표현을 감싸는 방식, API는 간결하지만 암묵적 주입
- Hooks: 로직만 공유하고 표현은 컴포넌트가 담당, 가장 간단한 형태
- Render Props: 표현을 완전히 호출자에게 위임, 최대 유연성

## 언제 쓰면 좋은가

- 로직은 같지만 화면(표현)을 화면마다 다르게 커스터마이즈해야 할 때
- 컴포넌트 내부 상태를 외부가 자유롭게 소비/표현해야 할 때

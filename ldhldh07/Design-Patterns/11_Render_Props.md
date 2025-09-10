# Render Props

Render Props는 컴포넌트를 렌더하는 함수 형태를 prop으로 전달하여, 상위 컴포넌트에서 관리하는 동적인 상태를 하위 컴포넌트 UI에 공유하는 패턴이다.



## Render 함수의 형태

```ts
import React from "react";

type FetchRender<T> = (state: { loading: boolean; error?: Error; data?: T }) => React.ReactNode;

function DataFetcher<T>({ url, render }: { url: string; render: FetchRender<T> }) {
  const [state, setState] = React.useState<{ loading: boolean; error?: Error; data?: T }>({
    loading: true,
  });

  React.useEffect(() => {
    let cancelled = false;

    fetch(url)
      .then(res => res.json())
      .then(data => !cancelled && setState({ loading: false, data }))
      .catch(error => !cancelled && setState({ loading: false, error }));

    return () => {
      cancelled = true;
    };
  }, [url]);

  return <>{render(state)}</>;
}
```



## 예시 - 리액트 훅폼의 Controller

```ts
<Controller
  name="email"
  control={control}
  render={({ field, fieldState }) => (
    <div>
      <input {...field} placeholder="이메일 입력" />
      {fieldState.error && <p>{fieldState.error.message}</p>}
    </div>
  )}
/>
```



장점

- UI 자유도: 상위 컴포넌트에서 관리하는 로직(state, field 등)을 하위에서 자유롭게 UI에 반영 가능

- 유연성: 마크업 레벨에서 원하는 속성/구조를 커스터마이징할 수 있음

  → Controller에서 Material UI, Chakra UI, Tailwind Input 등 다양한 컴포넌트 적용 가능

단점

- 가독성 저하: JSX 속성(render) 안에 UI를 작성해야 해서 컴포넌트 속성이 너무 길어짐
- 관심사 분리 부족: 로직/마크업이 컴포넌트 prop 영역에 섞여 코드가 어색하게 느껴질 수 있음



#### 대안 – useController 훅 활용

-> 리액트 훅폼 또한 useController로 전환하는 것이 바람직

react-hook-form은 동일한 기능을 커스텀 훅으로도 제공한다.

#### Controller (Render Props)

```ts
<Controller
  name="email"
  control={control}
  render={({ field, fieldState }) => (
    <div>
      <input {...field} placeholder="이메일 입력" />
      {fieldState.error && <p>{fieldState.error.message}</p>}
    </div>
  )}
/>
```



#### useController (Hooks)

```ts
function EmailInput() {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "email", control });

  return (
    <div>
      <input {...field} placeholder="이메일 입력" />
      {error && <p>{error.message}</p>}
    </div>
  );
}

// 사용
<EmailInput />
```



종합

- Render Props는 상위 로직과 하위 UI를 분리하는 장점이 있다
- 하지만 JSX 속성 영역에 UI를 끼워넣어야 하므로 가독성이 떨어진다
- 따라서 react-hook-form처럼 동일한 기능을 훅(useController)으로 제공하는 방식이 더 바람직하다
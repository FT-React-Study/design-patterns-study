# HOC

HOC는 high-order-component로 고차 컴포넌트이다.

이는 한차수 위의 컴포넌트를 의미한다.

컴포넌트를 인자로 받아서 그 컴포넌트에 속성을 부여하는 식으로 구현된다.

## HOC의 목적

- 공통 로직 추출 : 반복되는 로직을 한 곳에서 관리
- 관심사 분리 : UI와 상태/이펙트 로직을 분리
- 재사용성 : 동일한 기능(인증, 로깅, 추적 등)을 다양한 컴포넌트에 적용

한차수 위에 위치한다는 것은 컴포넌트를 래핑해서 여러 컴포넌트에 적용될 수 있는 공통 속성을 부여한다는 것이다.

```ts
const CompA = () => {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <div>A 컴포넌트: {width}px</div>;
};

const CompB = () => {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <div>B 컴포넌트: {width}px</div>;
};
```

윈도우에 따라 width를 resize하는 기능은 여러 컴포넌트에서 반복되는 속성입니다.

이 기능을 각각에 컴포넌트에 적용하는 경우 위와 같이 중복되는 코드가 발생합니다.

```ts
function withWindowWidth<P>(WrappedComponent: React.ComponentType<P & { width: number }>) {
  return function ComponentWithWidth(props: P) {
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
      const onResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    return <WrappedComponent {...props} width={width} />;
  };
}

const CompA = ({ width }: { width: number }) => <div>A 컴포넌트: {width}px</div>;
const CompB = ({ width }: { width: number }) => <div>B 컴포넌트: {width}px</div>;

const CompAWithWidth = withWindowWidth(CompA);
const CompBWithWidth = withWindowWidth(CompB);
```

이때 Hoc를 이용하면 중복되는 부분을 제거하고 재사용할 수 있습니다.





## HOC는 훅으로 대체 가능한가

리액트에서 커스텀 훅을 도입한 이후로 대부분의 Hoc는 커스텀 훅으로 대체 가능합니다.

```ts
function useWindowWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

const MyComponent = () => {
  const width = useWindowWidth();
  return <p>현재 창 너비: {width}px</p>;
};
```

그리고 이 형태가 현재 리액트가 지향하는 방향에 가깝습니다.

특히 여러개의 중복된 속성을 사용할 경우 중첩해야 하는 hoc에 비해 커스텀 훅은 논리적 흐름에 따라 여러개의 동작을 정렬할 수 있습니다.



## 대체 불가능한 경우

그럼에도 아직은 hoc가 더 좋은 경우가 있습니다.



클래스 컴포넌트 지원

- 훅은 함수형에서만 동작하므로, 레거시 클래스 컴포넌트를 확장할 때는 HOC가 필요합니다.
- 대표적으로 ErrorBoundary 같은 기능을 클래스 기반으로 감쌀 때.



외부 감싸기(Wrapper)가 목적일 때

- 훅은 내부 로직만 공유할 수 있고, 컴포넌트를 바깥에서 감쌀 수는 없습니다.
- 레이아웃, 에러 경계, Provider 삽입 등은 여전히 HOC 패턴이 더 자연스럽습니다.



정적 프로퍼티/메타데이터 보존

- 훅은 displayName이나 커스텀 static 속성을 건드릴 수 없지만, HOC는 hoist-non-react-statics로 이런 속성을 보존하면서 기능을 확장할 수 있습니다.

  

React 내장 HOC 계열 API

- React.memo, React.forwardRef처럼 리액트가 직접 제공하는 HOC 스타일 API는 훅으로 대체되지 않습니다.
- 이는 “컴포넌트 단위 변형”을 위해 의도적으로 HOC 형태로 설계된 기능입니다.

```ts
const List = ({ items }: { items: string[] }) => {
  console.log("리렌더링");
  return (
    <ul>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
};


const OptimizedList = React.memo(List);
```


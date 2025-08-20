# 개요

 리액트 디자인 패턴 중 하나로, 렌더링 할 컴포넌트를 props 로 받아서 내부 로직을 통해 렌더링 하는 방식입니다.

# 왜 사용하나요?

 UI 와 상태관리 로직을 분리하여, 상태관리 로직은 공유하면서, UI 표현 방식은 외부에서 주입 할 수 있습니다. 즉, UI 와 상태관리 로직을 분리하기 위해 사용합니다.

# 활용

 render props 는 오래전 부터 존재하던 패턴이지만 아직도 활발히 사용됩니다. 실제로 리액트 기반 디자인시스템 라이브러리에서 자주 보이는 두가지 API 제공 방법 중 하나죠. (render props 로 넘기는 방법, 커스텀 훅을 직접 사용하는 방법)

```tsx
<VirtualList
  items={rows}
  itemHeight={32}
  renderItem={(row, i) => <Row key={row.id} data={row} index={i} />}
/>
```

render prop 이라고 해서 반드시 prop 이름이 render 일 필요는 없습니다. 위의 예시의 경우 VirtualList 컴포넌트는 내부적으로 `props.renderItem()` 와 같이 호출할 것 입니다.

# 단점

### 대부분의 경우 커스텀 훅으로 대체 될 수 있다.

 단점이라고 하기는 모호하지만, 좀 더 내부 상태 로직에 수정을 가할 수 있는 커스텀 훅이 대부분을 대체할 수 있습니다. 하지만, 이는 디자인 시스템 라이브러리 형태에서는 오히려 장점으로 작용할 수 있겠습니다. 편리한 사용성과 굳이 내부 상태 로직을 변경할 필요가 없게 된다면 말이죠.

---

[Render Props 패턴](https://patterns-dev-kr.github.io/design-patterns/render-props-pattern/)
# Compound

>  부모 컴포넌트와 자식 컴포넌트들이 참조 관계(Composition)로 연결되어 동작하도록 만드는 패턴이다



단일 컴포넌트를 여러 작은 하위 컴포넌트로 쪼갠 뒤, 하나의 의미 있는 컴포넌트 시스템처럼 묶어서 사용하는 방식이다



## 장점

### 의미적 관계 표현

<Dropdown>, <Dropdown.Item>, <Dropdown.Trigger> 같은 식으로, 계층적 구조가 컴포넌트들이 한 시스템의 일부임을 직관적으로 드러낸다

### 네임스페이스

Dropdown.Item처럼 부모 네임스페이스 아래에 두어, 전역적으로 겹치는 경우를 방지한다.

import시에도 하나의 부모 컴포넌트만 import하면 이 시스템의 전체 컴포넌트를 사용할 수 있다.

### 유연한 조합

부모 컴포넌트가 Context를 제공하고, 자식들이 이를 소비하므로 prop drilling이 줄어듦.

개발자가 원하는 방식대로 자식 컴포넌트들을 조합할 수 있어 확장성과 재사용성이 높아진다.



## 예시

```ts
const Dropdown = ({ children }) => {
  return (
    <DropdownProvider>
      <div className="dropdown">{children}</div>
    </DropdownProvider>
  )
}

const Trigger = ({ children }) => {
  const { toggle } = useDropdownContext()
  return <button onClick={toggle}>{children}</button>
}

const Item = ({ children }) => {
  const { close } = useDropdownContext()
  return <div onClick={close}>{children}</div>
}

Dropdown.Trigger = Trigger
Dropdown.Item = Item


<Dropdown>
  <Dropdown.Trigger>메뉴 열기</Dropdown.Trigger>
  <Dropdown.Item>옵션 1</Dropdown.Item>
  <Dropdown.Item>옵션 2</Dropdown.Item>
</Dropdown>
```

컴포넌트 함수로 정의한 뒤 `Dropdown.Item = Item`과 같은 형태로 참조한다
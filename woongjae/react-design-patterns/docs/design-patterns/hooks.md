# Hooks 패턴이란?

 리액트 16.8 부터 제공된 함수형 컴포넌트의 상태 관리 API 로, 이 hooks 함수들을 활용해 커스텀 hooks 를 만들 수 있게 되었습니다. 이 hooks 들을 통해 커스텀 hooks 를 만들어 상태 관리 로직을 분리하는 것을 hooks 패턴, 커스텀 훅 이라고 합니다. 

# 왜 사용하나요?

 HOC 나 Render props 와 비슷하게, 로직을 여러 컴포넌트에서 재사용하기 위해 사용합니다. 하지만, HOC 와 Render Props 와 다르게, 함수형 컴포넌트가 의존성을 받아와 내부에서 사용합니다.

# 활용

```tsx
import { useEffect, type RefObject } from "react";

export function useOutsideClickEffect(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, onOutsideClick]);
}

```

```tsx
function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = React.useState(false)

  function handleDown({ key }) {
    if (key === targetKey) {
      setKeyPressed(true)
    }
  }

  function handleUp({ key }) {
    if (key === targetKey) {
      setKeyPressed(false)
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)

    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  return keyPressed
}
```

# 유의할 점

![HOC 는 공통 로직을 사용 컴포넌트의 외부에서 제공하기 때문에 사용 컴포넌트는 공통 로직을 접근, 사용 할 수 없습니다. 하지만 커스텀 훅 같은 경우에는 사용 컴포넌트의 내부 상태나 props 를 커스텀 훅에 제공해 그 로직에 따른 결과값을 리턴 받아 직접 사용합니다.](attachment:4dc01f79-d9fb-4366-9378-105c715d8f7d:image.png)

HOC 는 공통 로직을 사용 컴포넌트의 외부에서 제공하기 때문에 사용 컴포넌트는 공통 로직을 접근, 사용 할 수 없습니다. 하지만 커스텀 훅 같은 경우에는 사용 컴포넌트의 내부 상태나 props 를 커스텀 훅에 제공해 그 로직에 따른 결과값을 리턴 받아 직접 사용합니다.

 커스텀 훅이 HOC 나 Render props 와 같은 디자인 패턴을 많이 대체한 것은 맞지만, 모든 것을 전부 대체한 은탄환이라고 생각하는 것은 좋지 않은 것 같습니다. 사용상의 장단점이 있다고 생각하고 필요한 상황에서 적절히 사용하는 것이 중요하다고 생각합니다.

---

[Hooks 패턴](https://patterns-dev-kr.github.io/design-patterns/hooks-pattern/)
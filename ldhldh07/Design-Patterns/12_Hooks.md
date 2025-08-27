# Hooks

리액트에서 상태를 관리하고 이를 생명주기에 따라 동작을 설정할 수 있도록 해주는 기능이 필요하다.

Hooks는 컴포넌트의 상태와 생명주기 관련 로직을 `함수형 컴포넌트` 에서 다룰 수 있게 해주는 도구입니다.

그를 위해 use~ 형태의 도구들을 제공합니다



## 이전의 상태관리

`React v16.8`이전에는 상태 관리 및 컴포넌트 생명주기를 관리하기 위해 함수형 컴포넌트가 아닌 클래스 컴포넌트를 이용했습니다.

```ts
import React from "react";

class Timer extends React.Component {
  state = {
    count: 0,
  };

  // 컴포넌트가 마운트될 때 실행
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(prev => ({ count: prev.count + 1 }));
    }, 1000);
  }

  // 컴포넌트가 언마운트될 때 실행
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return <h1>타이머: {this.state.count}초</h1>;
  }
}

export default Timer;
```

클래스 내의 변수로 state를 선언하고 컴포넌트 클래스의 메소드들을 override해서 생명주기별 동작을 정의했습니다.



이로써 컴포넌트의 생성, 마운트, 언마운트, 업데이트 단계별로 어떤 동작을 할지 각 메소드 함수 영역 내에서 정의할 수 있었고

render() 의 ui영역에서 그 state를 호출할 수 있었습니다.



## Hooks의 구성

hooks의 구성이 되는 동작들과 기존 Class Component에서 대치되는 동작들을 비교해서 어떤 역할을 하는지 파악할 수 있습니다.

## useState - state / constructor()

```ts
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  render() {
    return <button onClick={() => this.setState({ count: this.state.count + 1 })}>
      {this.state.count}
    </button>;
  }
}
```

```ts
function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

count라는 상태를 정의하고 조작하는 클래스 컴포넌트와 함수형 컴포넌트 + hooks의 예시 코드입니다

useState가 하는 역할은 다음과 같습니다.

- 상태 변수인 state를 클래스(컴포넌트)에서의 내부 상태로 정의합니다

  ```ts
    constructor(props) {
      super(props);
      this.state = { count: 0 };
    }
  // 생성자 함수에서 state객체의 속성으로 count를 설정
  ```

  ```ts
    const [count, setCount] = useState(0); 
  // 반환값의 첫번째 값을 count로 정의
  ```

- 컴포넌트 생성시 생성자 함수 내에서 state를 초기화합니다.

  ```ts
    constructor(props) {
      super(props);
      this.state = { count: 0 };
    }
  // 생성자 함수에서 count의 값으로 0을 정의
  ```

  ```ts
    const [count, setCount] = useState(0); 
  // useState의 인자로 0을 입력
  ```

  

- 상태의 값을 setter로 변경합니다.

  ```ts
  <button onClick={() => this.setState({ count: this.state.count + 1 })}>
  // this.setState 메소드의 인자로 count 값을 override합니다. 기존의 값을 호출한 뒤 계산 로직을 넣습니다.
  ```

  ```ts
    const [count, setCount] = useState(0); 
    ...
    <button onClick={() => setCount(count + 1)}>{count}</button>
  
  // useState의 두번째 반환값으로 setCount를 정의합니다.
  // 그 setter함수의 인자로 변화될 값을 입력합니다.

### useEffect - componentDidMount() / componentDidUpdate() / componentWillUnmount()

```ts
class Timer extends React.Component {
  state = { seconds: 0, count: 1 };

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(prev => ({ seconds: prev.seconds + 1 }));
    }, 1000);
  }
 
  componentDidUpdate(prevProps, prevState) {
    if (prevState.count !== this.state.count) {
      document.title = `현재 카운트: ${this.state.count}`;
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <h1>{this.state.seconds}</h1>;
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    )
  }
}
```

```ts
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    document.title = `현재 카운트: ${count}`;
  }, [count]);

  return (
    <h1>{seconds}</h1>;
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  )
}
```

useEffect 동작이 특정 주기에 재실행되도록 처리합니다.



- 마운트 될때의 동작

  ```ts
   componentDidMount() {
      this.interval = setInterval(() => {
        this.setState(prev => ({ seconds: prev.seconds + 1 }));
      }, 1000);
    }
  //componentDidMount로 동작 정의
  ```

  ```ts
    useEffect(() => {
      const interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
  
      ...
    }, []);
  // 빈 배열을 가진 useEffect에서 실행
  ```

- 특정 값이 업데이트 될 때 재실행

  ```ts
    componentDidUpdate(prevProps, prevState) {
      if (prevState.count !== this.state.count) {
        document.title = `현재 카운트: ${this.state.count}`;
      }
    }
  // componentDidUpdate를 사용 prevState를 받아서 값이 업데이트 됐는지 직접 로직 작성, 그 경우에 따라 재실행 로직 작성
  ```

  ```ts
    useEffect(() => {
      document.title = `현재 카운트: ${count}`;
    }, [count]);
  // 의존성 배열에 있는 값이 변할 경우 내부의 동작이 재실행
  ```

- 언마운트될 때 실행

  ```ts
    componentWillUnmount() {
      clearInterval(this.interval);
    }
  //componentWillUnmount내의 동작으로 정의
  ```

  ```ts
    useEffect(() => {
      ..
  
      return () => clearInterval(interval);
      // useEffect의 리턴값으로 동작 정의
    }, []);
  ```

### useContext - contextType / Consumer

```ts
class ThemedText extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <p style={{ color: this.context.color }}>Hello</p>;
  }
}
```

```ts
function ThemedText() {
  const theme = useContext(ThemeContext);
  return <p style={{ color: theme.color }}>Hello</p>;
}
```

### useRef

```ts
class InputFocus extends React.Component {
  inputRef = React.createRef();
  // createRef 사용
  focusInput = () => {
    this.inputRef.current.focus();
  };

  render() {
    return (
      <>
        <input ref={this.inputRef} />
        <button onClick={this.focusInput}>Focus</button>
      </>
    );
  }
}
```

```ts
function InputFocus() {
  const inputRef = useRef(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

객체 상태 유지

### useReducer

```ts
class Counter extends React.Component {
  state = { count: 0 };

  increment = () => this.setState({ count: this.state.count + 1 });
  decrement = () => this.setState({ count: this.state.count - 1 });

  render() {
    return (
      <>
        <button onClick={this.decrement}>-</button>
        <span>{this.state.count}</span>
        <button onClick={this.increment}>+</button>
      </>
    );
  }
}
```

```ts
function Counter() {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "increment": return { count: state.count + 1 };
      case "decrement": return { count: state.count - 1 };
      default: return state;
    }
  }, { count: 0 });

  return (
    <>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
    </>
  );
}
```





## **정리**

Hooks는 클래스 컴포넌트의 상태 관리(state)와 생명주기 메소드들을 함수형 컴포넌트에서도 쓸 수 있도록 옮겨온 도구입니다.



| **클래스 컴포넌트**        | **Hooks**             |
| -------------------------- | --------------------- |
| constructor + this.state   | useState              |
| setState                   | useState / useReducer |
| componentDidMount / Update | useEffect             |
| componentWillUnmount       | useEffect cleanup     |
| contextType / Consumer     | useContext            |
| createRef / 인스턴스 변수  | useRef                |

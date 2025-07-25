# Provider 패턴

## 개요

 특정 객체의 생성과 전달 책임을 캡슐화(Provider)하여, 특정 객체들을 제공하는 *설계적인* 디자인 패턴입니다. 보통 객체를 직접 생성하거나, 의존성을 명시적으로 관리하지 않고, Provider 가 대신 관리하게 합니다.

## 왜 사용하나요?

 Provider 패턴은 객체 생성과 전달을 관리함으로써 의존성 주입, 지연 초기화, 느슨한 결합을 가능하게 합니다. 이를 통해 Provider 와 Consumer 사이에 결합도를 낮추어 더 유연한 설계 및 구현을 하는 것이 주 목적입니다.

## 활용

### 예시 1. React 의 Context API

```tsx
export const ThemeContext = React.createContext()

const themes = {
  light: {
    background: '#fff',
    color: '#000',
  },
  dark: {
    background: '#171717',
    color: '#fff',
  },
}

export default function App() {
  const [theme, setTheme] = useState('dark')

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const providerValue = {
    theme: themes[theme],
    toggleTheme,
  }

  return (
    <div className={`App theme-${theme}`}>
      <ThemeContext.Provider value={providerValue}>
        <Toggle />
        <List />
      </ThemeContext.Provider>
    </div>
  )
}
```

 React Context API 는 Provider 패턴을 구현하여 React 구 버전의 여러 문제를 해결하기 위해 구현한 것 입니다. `Provider` 의 `value` prop 안에 들어간 값 `providerValue` 를 `Toggle` 컴포넌트와 `List` 컴포넌트가 사용할 수 있습니다. 

### 예시 2. Spring

```java
@Component
public class NotificationService {
    private final Provider<MessageSender> senderProvider;

    public NotificationService(Provider<MessageSender> senderProvider) {
        this.senderProvider = senderProvider;
    }

    public void send(String msg) {
        MessageSender sender = senderProvider.get(); // 여기서 의존성을 제공받음
        sender.send(msg);
    }
}
```

### 예시 3. NestJS

```tsx
@Injectable()
export class NotificationService {
  constructor(
    @Inject('MessageSender') private readonly sender: MessageSender,
  ) {}

  notify() {
    this.sender.send('Hello');
  }
}
```

## 단점

### 구조적 복잡성

 Provider 에 객체 구조나 생성 등이 감추어져 있어 Provider 가 많아진다면 객체 생성 파악 등이 어렵습니다.

### 런타임 오류 가능성 증가

 느슨한 결합의 문제로 Provider 에서 제공하는 의존성이 제대로 주입되지 않았을 때 Consumer 가 객체를 사용하려고 하면 오류가 생길 수 있습니다.
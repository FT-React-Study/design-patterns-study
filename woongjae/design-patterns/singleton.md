# Singleton 패턴

## 개요

 한 애플리케이션에 특정 클래스의 인스턴스를 1개만 생성하고 사용하는 디자인 패턴입니다. 싱글톤 패턴은 인스턴스가 **1개만 생성되는 것을 보장할 필요가 있습니다.**

## 왜 사용하나요?

  싱글톤 패턴의 장점은 메모리를 절약할 수 있다는 점과, 하나의 인스턴스만 존재한다는 것을 보장하기 때문에 자원을 공유할 때 유리하다는 점이 있습니다. 이 때문에 싱글톤을 상태를 공유하거나, 자원을 공유해야할 때 사용합니다. 그래서 DB 커넥션 인스턴스, logger, 전역 상태 관리 스토어 등을 구현할 때 사용하기 좋습니다.

## 활용

### 예시 1. Logger 객체

```tsx
class Logger {
  private static instance: Logger | null = null;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string) {
    console.log(message);
  }
}

const logger = Object.freeze(new Logger());
export default logger;
```

 logger 같은 경우에는 로그를 쌓아두는 객체 자체가 하나인 것이 유리합니다. 하나의 객체만 보고 로그들을 정리하는게 좋으니까요. 그리고 `Object.freeze()` 를 통해 객체 구조의 변경을 막습니다.

### 예시 2. 더블 체크 락킹

```java
public class Singleton {
    private static volatile Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

 `volatile` 키워드는 일반적으로 컴파일러의 재량을 제한하는 키워드로 자바에서는 GC 되지 않도록 하는 키워드입니다. 해당 객체는 사용자가 의도하여 인스턴스를 메모리에서 내리기 전까진 존재하는 것이 보장되어야 하므로, 가비지 컬렉터가 함부로 인스턴스를 메모리에서 내려가지 않게 하기 위함입니다.

  더블 체크 락킹이라는 패턴은 인스턴스가 `null` 이 아닌 경우를 거르고 (이를 통해 성능 향상), `synchronized` 키워드를 통해 `Singleton.class` 에 락을 걸어 동기화 문제를 해결 합니다.

## 부가적인 내용

### 프론트엔드 전역 상태 관리

 전역 상태 관리 라이브러리에서 제공하는 전역 상태 관리 스토어도 하나만 사용하는 것을 강력히 권장합니다. 하지만, 라이브러리 내에서 스토어 인스턴스를 싱글톤 형태로 제공하지는 않습니다. 이 이유는 두가지가 있습니다. 첫번째는 앞서 말한 실제로 전역 상태 관리 스토어를 정말 한 앱에서 글로벌한 스토어로 사용할 때도 많지만, 리액트에서의 컨텍스트 API 를 대체하기 위한 수단으로도 많이 사용하기 때문이죠.

```tsx
class ThemeStore {
  private _darkMode = false;

  get darkMode() {
    return this._darkMode;
  }

  toggle() {
    this._darkMode = !this._darkMode;
  }
}

const themeStore = new ThemeStore();
export default themeStore;
```

## 단점

### 결합도가 높다

 여러 모듈들이 싱글톤에 직접 의존하기에, 싱글톤 관련 변화가 생기면 너무 많은 모듈에 영향을 미칠 수 있습니다.

### 테스트가 어렵다

 하나의 인스턴스를 매번 초기화해 테스트를 진행해야하므로 테스트가 어렵습니다.

### 동시성 문제

 여러 기법을 통해 해결은 가능하지만, 결국 복잡성이 증가한다는 것은 문제가 될 수 밖에 없습니다.
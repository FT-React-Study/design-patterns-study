# ✨ Factory 패턴

## 1. 패턴 정의: 정의와 핵심 요약

- Factory 패턴은 new 없이 함수를 호출해 객체를 생성하는 방식으로, 객체 생성 로직을 깔끔히 추상화하는 설계 기법이다.
- 별도의 팩토리 함수에서 객체를 만들어 주기 때문에 클라이언트 코드는 생성 방식에 대해 몰라도 되고, 환경이나 설정에 따라 유연하게 대응할 수 있다.

## 2. 사용 목적: 이 패턴이 필요한 이유

- 여러 곳에서 반복적으로 객체를 생성해야 할 때, 생성 로직을 한 곳에 모아서 관리할 수 있다.
- 환경 별, 사용자 설정 별로 생성할 객체의 구조가 달라져야 할 때에도, 클라이언트 코드는 변하지 않고 팩토리만 수정하면 된다.

## 3. 패턴 설명: 동작 방식과 구성 요소

### 구성 요소

![Factory](./images/factory-structure.png)

> Creator (생성자 역할)

- 객체를 생성하는 팩토리 메서드를 정의하는 주체.
- 구체적으로 어떤 객체를 만들지는 하위 구현체에 위임하지만, 생성 과정을 캡슐화하는 공통 인터페이스를 제공한다.

> 팩토리 메서드 (createProduct)

- 실제 객체 생성을 담당하는 메서드.
- 반환 타입은 추상화된 Product 인터페이스로 고정되어 있어, 클라이언트는 구체 클래스가 무엇인지 알 필요가 없다.

> Product (제품 인터페이스)

- 팩토리에서 생성되는 객체가 따라야 할 계약(공통 메서드 집합).
- 구체적인 제품 클래스들은 이 인터페이스를 구현한다.

> Concrete Creator (구체 생성자)

- Creator를 상속하거나 구현해서, 팩토리 메서드를 오버라이드하고 실제 어떤 Product를 반환할지를 결정한다.

> Concrete Product (구체 제품)

- Product 인터페이스를 구현한 실제 객체.
- 어떤 Creator가 호출되느냐에 따라 서로 다른 구체 제품이 생성된다.

> Client (사용자)

- Creator의 인터페이스만 사용해서 객체를 생성하고, Product 인터페이스를 통해 결과 객체를 다룬다.
- 내부에서 어떤 구체 클래스가 쓰였는지는 전혀 알 필요 없다.

### 동작 방식

- `클라이언트`는 `Creator`가 제공하는 `팩토리 메서드`를 호출한다.
- `Creator`는 내부적으로 어떤 `Product`를 생성할지 구체 `Creator`에게 위임한다.
- 구체 `Creator`는 팩토리 메서드를 구현(override)하여 특정 `Concrete Product`를 반환한다.
- `클라이언트`는 반환된 `Product` 인터페이스를 통해 객체를 다루며, 내부에서 어떤 클래스가 생성되었는지는 알 필요가 없다.

### 장점

- 객체 생성 로직과 사용 로직이 분리되어, 결합도가 낮아진다.
- 새로운 제품군을 추가할 때, 클라이언트 코드 변경 없이 `Creator`/`ConcreteProduct`만 수정하면 된다.
- 동일한 인터페이스를 따르기 때문에 확장성과 일관성이 높다.

### 단점

- 구조가 복잡해져, 단순히 객체 몇 개만 생성할 경우에는 오히려 과한 설계일 수 있다.
- 구체 클래스 수가 늘어나면 클래스 구조 자체가 무거워질 수 있다.

## 4. 코드 및 활용 예시

![Factory Example](./images/factory-example.png)

```ts
// Product 인터페이스
interface Button {
  render(): void;
}

// Concrete Product
class HTMLButton implements Button {
  render() {
    console.log("Render HTML Button");
  }
}

class WindowsButton implements Button {
  render() {
    console.log("Render Windows Button");
  }
}

// Creator (팩토리 메서드 보유)
abstract class Dialog {
  abstract createButton(): Button;

  renderDialog() {
    const btn = this.createButton();
    btn.render();
  }
}

// Concrete Creator
class WebDialog extends Dialog {
  createButton(): Button {
    return new HTMLButton();
  }
}

class WindowsDialog extends Dialog {
  createButton(): Button {
    return new WindowsButton();
  }
}

// 사용 예시
let dialog: Dialog;

dialog = new WebDialog();
dialog.renderDialog(); // Render HTML Button

dialog = new WindowsDialog();
dialog.renderDialog(); // Render Windows Button
```

## 5. 정리와 확장: 학습 포인트와 추가 학습거리

- Factory Method 패턴은 객체 생성 로직을 하위 클래스에 위임함으로써, 클라이언트가 구체 클래스에 의존하지 않고도 객체를 생성·사용할 수 있게 한다.
- 새로운 객체군을 도입할 때 기존 코드를 건드리지 않고 확장할 수 있는 `개방-폐쇄 원칙(OCP)`을 잘 보여주는 예시다.

### 추가 학습: 자바스크립트에서의 팩토리 함수

- 자바스크립트에서는 Factory Method 패턴처럼 복잡하게 클래스 계층을 두지 않고, 보통은 new 키워드 없이 객체를 반환하는 함수 형태로 간단히 구현한다.
- 특히 ES6 화살표 함수와 객체 리터럴을 이용하면 매우 간결하다.

```ts
const createUser = (name, age) => ({
  name,
  age,
  greet() {
    console.log(`Hi, I'm ${this.name}, ${this.age} years old.`);
  },
});

const user = createUser("Hanbyeol", 30);
user.greet(); // Hi, I'm Hanbyeol, 30 years old.
```

> 생성자 함수와의 차이

- `User(name, age) { this.name = name; this.age = age; }` 처럼 new 키워드를 써야 하는 생성자 함수와 달리, 팩토리 함수는 단순히 객체를 반환한다.
- 따라서 `new`를 실수로 빼먹는 문제나, `this` 바인딩 관련 오류에서 자유롭다.

> 캡슐화와 은닉

- 팩토리 함수 안에서 `클로저`를 이용하면 `private` 변수를 만들 수도 있다. 이는 ES6 클래스가 도입되기 전, 자바스크립트에서 은닉을 구현하는 대표적인 방식이었다.

```ts
const createCounter = () => {
  let count = 0; // private
  return {
    increment: () => ++count,
    get: () => count,
  };
};

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.get()); // 1
console.log(counter.count); // undefined (외부 노출 안 됨)
```

> 정리

- JS에서 팩토리 함수는 단순히 객체 생성을 편리하게 하고, `new`에 의존하지 않으며, 클로저를 통한 은닉 같은 부가 효과도 제공할 수 있다.
- 즉, GoF의 Factory Method처럼 무겁게 계층 구조를 만들진 않지만, 일상적인 코드에서 가볍고 실용적인 팩토리 패턴으로 널리 사용된다.

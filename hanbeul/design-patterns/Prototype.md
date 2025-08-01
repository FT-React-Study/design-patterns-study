# ✨ Prototype 패턴

## 1. 패턴 정의: 정의와 핵심 요약

- Prototype 패턴은 기존 객체를 복제(clone)하여 새로운 객체를 생성하는 패턴이다.
- 복잡하거나 자주 생성되는 객체를 효율적으로 만들기 위한 방법으로, 클래스에 의존하지 않고 객체 자체를 템플릿으로 활용한다.

## 2. 사용 목적: 이 패턴이 필요한 이유

- 동일한 구조를 가진 객체를 반복적으로 생성할 필요가 있을 때 유용하다.
- 객체 생성 비용이 크거나, 런타임 중 동적으로 객체를 생성해야 하는 경우에 적합하다
- JavaScript처럼 클래스 없이도 객체를 직접 생성하고 확장할 수 있는 언어에서 특히 활용된다.

## 3. 패턴 설명: 동작 방식과 구성 요소

- Prototype 객체: 복제할 원형이 되는 객체
- 복제 메서드: `clone()` 또는 `Object.create()` 등의 방식으로 새로운 객체를 생성
- 복제 객체: Prototype을 참조하거나 상속받아 생성된 새로운 객체

![Prototype](./images/prototype-structure.png)

> 동작 흐름

- 프로토타입 객체를 정의한다.
- `clone()` 또는 `Object.create(proto)`를 통해 해당 객체를 복제한다.
- 복제된 객체는 `proto` 객체를 내부 `[[Prototype]]` 으로 설정하며, 그 프로토타입 체인을 통해 속성과 메서드를 상속받는다.
- 필요하다면 복제된 객체에 개별 속성을 덮어쓴다.

> Javascript에서의 프로토타입 체인

- `__proto__`: 비표준이지만 대부분 브라우저에서 지원되는 속성. 객체의 `[[Prototype]]`을 참조하거나 설정할 수 있다.
- `Object.getPrototypeOf(obj)`: 주어진 객체의 실제 프로토타입을 반환하는 메서드
- `Object.setPrototypeOf(obj, proto)`: 객체의 프로토타입을 동적으로 변경 (성능 저하 및 권장되지 않음)
- `Object.create(proto, [propertiesObject])`: 새로운 객체를 생성하고 프로토타입을 설정

## 4. 코드 및 활용 예시: 기본 구현

### 간단한 객체 기반 복제 예시 (Object.create)

```ts
const dog = {
  sound: "멍멍",
  speak() {
    return this.sound;
  },
};

// 복제: dog을 프로토타입으로 갖는 새로운 객체
const puppy = Object.create(dog);
puppy.sound = "왈왈";

console.log(puppy.speak()); // "왈왈"
console.log(dog.speak()); // "멍멍"
```

- `Object.create(proto)`는 원형 객체의 프로토타입 체인을 유지하면서 복제한다.

### 클래스 기반 복제 예시 (class, new)

```ts
class Dog {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name}: 멍멍!`;
  }
}

const dog1 = new Dog("초코");
// 복제: 동일한 데이터를 가진 새 인스턴스를 생성
const dog2 = new Dog(dog1.name);

console.log(dog2.speak()); // "초코: 멍멍!"
console.log(dog1 === dog2); // false (복제된 다른 인스턴스)
```

- `class` 문법도 내부적으로는 `prototype`을 기반으로 동작한다.
- `new` 키워드는 생성자 함수를 호출하고, 내부적으로 새로운 객체를 생성한 뒤 해당 객체의 `[[Prototype]]`을 클래스의 `prototype`으로 설정한다.

### 클래스 기반 확장 예시 (class, extends)

```ts
class Dog {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name}: 멍멍!`;
  }
}

class Puppy extends Dog {
  constructor(name, age) {
    super(name);
    this.age = age;
  }

  speak() {
    return `${super.speak()} (${this.age}살)`;
  }
}

const puppy = new Puppy("초코", 1);
console.log(puppy.speak()); // "초코: 멍멍! (1살)"
```

- `extends`를 통해 상위 클래스의 `prototype` 체인을 자동으로 설정한다.
- 구조 복제 후 확장이 필요한 경우 유용하며, Prototype 패턴의 확장형 구현이라 볼 수 있다.

## 5. 정리와 확장: 학습 포인트

- Prototype 패턴은 새로운 객체를 기존 객체를 기반으로 생성(복제)하는 생성 패턴이다. 구조나 초기값이 동일한 객체를 반복 생성할 때 유용하다.
- 자바스크립트는 클래스 기반이 아닌 프로토타입 기반 언어로, 모든 객체는 내부 슬롯 `[[Prototype]]`을 통해 상위 객체의 속성과 메서드를 상속받는다.
- `Object.create(proto)`는 가장 대표적인 Prototype 패턴 방식이며, `class + new`를 사용하는 생성자 기반 방식도 내부적으로는 `prototype` 체인을 활용한다.
- 복제된 객체는 원본의 `[[Prototype]]`을 유지하므로, 동일한 동작을 공유하면서도 개별 상태를 가질 수 있다.
- 프로토타입 기반 복제는 동적으로 구성 가능한 객체, 상속보다 얕은 복사, 인터페이스 일치 등의 장점을 갖는다.

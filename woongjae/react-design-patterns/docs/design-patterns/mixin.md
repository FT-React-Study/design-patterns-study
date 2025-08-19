# Mixin 패턴

## 개요

 어떤 객체의 속성이나 메서드를 직접 섞어 사용하는 디자인패턴 입니다. 

## 왜 사용하나요?

 다중상속을 지원하지 않는 언어에서 다중상속과 유사한 기능을 구현하기 위해 만들어진 디자인패턴 입니다.

## 예시

```tsx
// 믹스인
let sayHiMixin = {
  sayHi() {
    alert(`Hello ${this.name}`);
  },
  sayBye() {
    alert(`Bye ${this.name}`);
  }
};

// 사용법:
class User {
  constructor(name) {
    this.name = name;
  }
}

// 메서드 복사
Object.assign(User.prototype, sayHiMixin);

// 이제 User가 인사를 할 수 있습니다.
new User("Dude").sayHi(); // Hello Dude!
```

```tsx
class User extends Person {
  // ...
}

Object.assign(User.prototype, sayHiMixin);
```

```tsx
let sayMixin = {
  say(phrase) {
    alert(phrase);
  }
};

let sayHiMixin = {
  __proto__: sayMixin, // (Object.create를 사용해 프로토타입을 설정할 수도 있습니다.)

  sayHi() {
    // 부모 메서드 호출
    super.say(`Hello ${this.name}`); // (*)
  },
  sayBye() {
    super.say(`Bye ${this.name}`); // (*)
  }
};

class User {
  constructor(name) {
    this.name = name;
  }
}

// 메서드 복사
Object.assign(User.prototype, sayHiMixin);

// 이제 User가 인사를 할 수 있습니다.
new User("Dude").sayHi(); // Hello Dude!
```

## 단점

### 이름 충돌 위험

 믹스인끼리 상속 시, 같은 이름 메서드를 정의하면 이름 충돌로 의도하지 않은 동작이 이루어질 수 있음

### 버그 추적이 어려움

 믹스인이 내부적으로 다른 속성이나 메서드에 의존하면, 사용하는 쪽에서 이를 명시적으로 알기 어려움

 단점이 상당히 치명적이라, 현재는 사용하지 않는 것을 권장하는 패턴입니다. 이전 코드들을 읽을 때 참고하면 좋을 것 같고, 직접 사용하지는 않는게 좋아보입니다.

---

[믹스인](https://ko.javascript.info/mixins)

믹스인 예시
# Prototype

Prototype 패턴은 객체를 생성할 때 복잡한 초기화 과정을 반복하지 않고, 기존 객체를 복제(clone) 하여 새로운 객체를 만드는 생성 패턴이다.



## 기존 방식과 비교

객체 초기화 비용이 크거나, 동일한 속성과 동작을 가진 객체를 반복해서 만들어야 할 때 유용하다.

### 일반적인 초기화 방식

```ts
function createMonster(type) {
  const monster = {};
  monster.type = type;
  monster.hp = 100;
  monster.attack = () => console.log(`${type} attacks!`);
  monster.initTime = Date.now(); 

  return monster;
}

const orc1 = createMonster("orc");
const orc2 = createMonster("orc");
```

- 같은 유형의 객체를 만들기 위해 같은 초기화 과정을 반복함
- attack 메서드가 각 인스턴스에 매번 새로 생성됨 → 메모리 낭비

```ts
const orcPrototype = {
  type: "orc",
  hp: 100,
  attack() {
    console.log(`${this.type} attacks!`);
  }
};

function createOrc() {
  const orc = Object.create(orcPrototype);
  orc.initTime = Date.now(); // 얘만 런타임에서 설정
  return orc;
}

const orc1 = createOrc();
const orc2 = createOrc();
```

- 공통 속성과 메서드는 orcPrototype에서 공유됨
- 초기화 비용 절약 및 메모리 효율 향상



## 사용하는 경우

- 인스턴스 초기화 비용이 큰 경우
- 유사한 객체를 반복적으로 생성해야 할 때
- 런타임에 객체의 유형이 동적으로 결정되는 경우





### clone()

Prototype 패턴에서는 객체 복제를 위한 메서드를 보통 clone()이라고 부른다.

이는 기존 객체의 상태를 그대로 가진 복사 생성자 역할을 한다.

```ts
const monsterPrototype = {
  type: "orc",
  hp: 100,
  attack() {
    console.log(`${this.type} attacks!`);
  },
  clone() {
    return Object.create(this);
  }
};

const m1 = monsterPrototype.clone();
```

- Object.create(this)는 얕은 복제를 수행하며, this를 프로토타입으로 하는 새 객체를 반환

## 자바스크립트와 Prototype

자바스크립트는 프로토타입 기반 객체 지향 언어다.

```ts
class Dog {
  constructor(name) {
    this.name = name
  }

  bark() {
    return `Woof!`
  }
}

const dog1 = new Dog('Daisy')
const dog2 = new Dog('Max')
const dog3 = new Dog('Spot')
```



자바스크립트에는 프로토타입 객체에 공통된 속성과 메서드를 정의한다.

이 프로토타입 객체를 인스턴스들이 공유하여 동작하고 이 객체를 통해 상속이 이루어진다.

#### 자바스크립트의 class는 문법적 설렁탕이다

자바스크립트는 클래스 없이도 생성자 함수와 프로토타입을 통해 상속 및 메서드 공유가 가능하다.

ES6 이후 도입된 class 문법은 기존의 생성자 함수 + prototype 기반 구조를 더 간결하게 표현한 문법적 설탕이다.

자바스크립트의 class는 기존의 문법들을 가지고 자바의 class의 형태를 구현한 것이라는 것이다.

```ts
class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    return "Woof!";
  }
}

const dog1 = new Dog("Daisy");
```

```ts
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function () {
  return "Woof!";
};
```

이 두가지 코드는 똑같은 기능을 수행한다.



이는 자바 class의 new 생성자가 prototype 패턴을 구현한 것이고

거꾸로 말해 new 생성자로 ptototype 객체를 일정 부분  대체할 수 있다는 뜻이다.



여기에 class는 추가적인 특징을 가진다

- new를 통한 생성 이후에 호출해야 한다.
- 기존 class의 형태에서 가져온 extends, super와 같은 어법을 가진다.



### `prototype`과 `__proto__`



![image-20250728170256929](./04_prototype.assets/image-20250728170256929.png)

자바스크립트 객체는 내부적으로 [[Prototype]]을 갖고 있으며, __proto__는 이를 참조하는 접근자이다.

이 값은 보통 생성자 함수의 .prototype 속성과 같다.

```ts
function Dog() {}
const d = new Dog();

d.__proto__ === Dog.prototype;
```



### prototype chain

class 혹은 생성자 함수 기반 상속에서는 메서드를 찾을 때 **프로토타입 체인**을 따라 탐색한다.

```ts
class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    console.log("Woof!");
  }
}

class SuperDog extends Dog {
  constructor(name) {
    super(name);
  }

  fly() {
    console.log(`Flying!`);
  }
}

const dog1 = new SuperDog("Daisy");
dog1.bark();
dog1.fly();
```

- fly()는 SuperDog.prototype에서 바로 찾고,
- bark()는 프로토타입 체인을 따라 Dog.prototype에서 찾음



## prototype 관련 함수

| **함수**                          | **설명**                                                 |
| --------------------------------- | -------------------------------------------------------- |
| Object.getPrototypeOf(obj)        | 객체의 prototype을 안전하게 가져옴 (__proto__ 대신 권장) |
| Object.setPrototypeOf(obj, proto) | 객체의 prototype을 설정 (권장되지 않음 – 성능 이슈 있음) |

> [Object.setPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)는 퍼포먼스 문제로 자주 쓰지 않는 게 좋다.





## 정리

- Prototype 패턴은 복잡한 초기화 없이 **기존 객체를 복제해 새 객체를 생성**하는 데 사용된다.
- 자바스크립트는 **원래부터 프로토타입 기반 언어**이기 때문에 이 패턴과 매우 궁합이 잘 맞는다.
- class는 기존 prototype 기반의 문법을 감싼 문법적 설탕으로, **Prototype 패턴의 기능을 대부분 대체할 수 있다.**
- 그러나 clone() 방식이 더 적합한 경우도 있으며, 상황에 따라 선택적으로 사용하는 것이 좋다.
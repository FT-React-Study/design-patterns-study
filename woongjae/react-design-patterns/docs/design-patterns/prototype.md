# Prototype 패턴

## 개요

 기존 객체를 복제하여 새로운 객체를 생성하는 방식의 디자인 패턴입니다. 엄밀히 말하면 JS 의 프로토타입과 구분되지만, 유사한 부분이 많습니다.

## 왜 사용하나요?

 객체 자체의 생성 비용이 높은데, 이 객체와 유사한 형태가 많이 만들어져야하는 경우 비용 절감을 위해 사용합니다.

## 디자인패턴의 Prototype

```tsx
// Prototype 인터페이스
interface Clonable<T> {
  clone(): T;
}

// 상품 클래스
class Product implements Clonable<Product> {
  constructor(
    public name: string,
    public price: number,
    public category: string,
    public options: string[],
    public tags: string[],
    public metadata: Record<string, any>
  ) {}

  // 복제 메서드
  clone(): Product {
    return new Product(
      this.name,
      this.price,
      this.category,
      [...this.options],
      [...this.tags],
      structuredClone(this.metadata) // 깊은 복사
    );
  }
}
```

```tsx
// 기존 상품 정의
const original = new Product(
  "오가닉 코튼 쿠션",
  19900,
  "리빙",
  ["베이지", "아이보리"],
  ["친환경", "신상품"],
  { stock: 20, discount: 0 }
);

// 복사해서 새로운 상품 등록
const copied = original.clone();
copied.name = "오가닉 코튼 쿠션 (복사본)";
copied.metadata.stock = 0;

console.log(original.name); // "오가닉 코튼 쿠션"
console.log(copied.name);   // "오가닉 코튼 쿠션 (복사본)"
console.log(original.metadata.stock); // 20
console.log(copied.metadata.stock);   // 0
```

Prototype 디자인패턴을 통해 프론트엔드에서는 기록용 clone, Form 자동 값 채우기, 버전관리 등에 사용할 수 있습니다.

## JS의 Prototype

```tsx
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  console.log("Hi, " + this.name);
};
```

 JS의 Prototype 은 실제 객체를 생성하는 것은 아니고, 내부적으로 `__proto__` 속성을 통해 해당 함수의 속성을 관리하는 방식입니다. 

### Prototype chain

```tsx
class Parent {
  sayHi() {
    console.log("hi");
  }
}

class Child extends Parent {}

const c = new Child();
c.sayHi(); // hi
```

```tsx
const grandparent = {
  job: "농부"
};

const parent = Object.create(grandparent);
parent.hobby = "낚시";

const child = Object.create(parent);
child.name = "철수";

console.log(child.name);   // "철수" → child 자신에게 있음
console.log(child.hobby);  // "낚시" → parent에게 있음
console.log(child.job);    // "농부" → grandparent에게 있음
console.log(child.age);    // undefined → 어디에도 없음
```

 `Object.create()` 메서드는 지정된 프로토타입 객체 및 속성을 갖는 새 객체를 만듭니다. 이는 프로토타입 상속을 위해 만들어진 메서드입니다. 그래서 인자로 들어온 객체를 새로운 객체의 프로토타입으로 연결해줍니다. 일반적인 복사와 다르다는 것을 알아둬야 할 것 같네요.

## JS 의 클래스는 함수 선언의 문법적 설탕

```tsx
class Animal {
  speak() {
    console.log("동물이 소리 냄");
  }
}

class Dog extends Animal {
  speak() {
    super.speak();
    console.log("멍멍!");
  }
}

const d = new Dog();
d.speak();
```

```tsx
function Animal() {}

Animal.prototype.speak = function () {
  console.log("동물이 소리 냄");
};

function Dog() {
  Animal.call(this); // 부모 생성자 호출
}

// 핵심: 프로토타입 체인 구성
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// super.speak()의 효과를 구현
Dog.prototype.speak = function () {
  Animal.prototype.speak.call(this);
  console.log("멍멍!");
};

const d = new Dog();
d.speak();
```

## Prototype 디자인패턴의 단점

### 깊은 복사의 어려움

 객체를 깊은 복사로 제공해야하기 때문에, clone 할 객체가 복잡하면 관리하기 어렵습니다.
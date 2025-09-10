# ✨ Flyweight 패턴

## 1. 패턴 정의: 정의와 핵심 요약

- Flyweight 패턴은 많은 유사 객체 생성 시, 공통된 상태를 공유하여 메모리를 절약하는 구조적 디자인 패턴이다.
- 내부 상태(공유 가능한 변하지 않는 데이터)와 외부 상태(개별 인스턴스의 맥락적인 데이터)를 분리하여 효율적으로 객체를 관리할 수 있다.

## 2. 사용 목적: 이 패턴이 필요한 이유

- 유사한 객체가 대량으로 생성될 때, 각 객체가 동일한 정보를 중복 저장하면 메모리 소모가 극심해진다.
- Flyweight 패턴은 공통된 속성만 공유 객체로 관리하고, 개별 속성은 사용자 코드에서 별도로 제공해 줌으로써 메모리 효율을 향상할 수 있다.

## 3. 패턴 설명: 동작 방식과 구성 요소

![Flyweight](./images/flyweight-structure.png)

### 구성 요소

> Flyweight

- 공유 가능한 `intrinsic state`(변하지 않는 데이터)을 보관하는 객체.

> FlyweightFactory

- `Flyweight` 객체의 생성과 공유를 담당.
- 요청 받은 상태와 일치하는 `Flyweight`가 있으면 반환, 없으면 생성 후 캐싱.
- 캐싱된 `Flyweight` 객체를 관리하는 컬렉션을 유지한다.

> Client

- `FlyweightFactory`를 통해 `Flyweight`를 받아 사용하며, `extrinsic state`(컨텍스트별 데이터)를 함께 전달.

### 동작 방식

- `Client`가 `FlyweightFactory`에 요청 ⇒ `Factory`는 키를 기준으로 캐시 탐색
- `Flyweight`가 존재하면 재사용, 없으면 새 생성 후 캐시에 저장
- `Client`는 `Flyweight`의 메서드에 `extrinsic state`를 인자로 넘겨 사용

## 4. 코드 및 활용 예시

```ts
class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn; // intrinsic (공유)
    Object.freeze(this); // 공유 객체 불변화 권장
  }
}

// 공유 객체 캐시
const books = new Map();

// Flyweight Factory: 같은 ISBN이면 같은 인스턴스 재사용
const createBook = (title, author, isbn) => {
  if (books.has(isbn)) return books.get(isbn);
  const book = new Book(title, author, isbn);
  books.set(isbn, book);
  return book;
};

// 개별 목록: 공유 객체 + 개별 상태(extrinsic)를 함께 보관
const bookList = [];

const addBook = (title, author, isbn, availability, sales) => {
  const fly = createBook(title, author, isbn); // 공유 객체 참조
  const entry = {
    book: fly, // 공유 상태(참조)
    availability, // 개별 상태
    sales, // 개별 상태
  };
  bookList.push(entry);
  return entry;
};

// 사용 예시
const a = addBook("Dune", "Frank Herbert", "9780441172719", "in-stock", 1200);
const b = addBook("Dune", "Frank Herbert", "9780441172719", "sold-out", 1300);

// 같은 ISBN은 같은 인스턴스를 공유한다 ⇒ true
console.log(a.book === b.book);
```

## 5. 정리와 확장: 학습 포인트와 추가 학습거리

- Flyweight는 메모리 최적화 중심 구조 패턴이며, 대량의 유사 객체 생성 시 효과적이다.
- `intrinsic` / `extrinsic` state 분리, `Factory` 기반 객체 공유가 핵심 설계 기법이다.
- 바람직하게 사용 시 메모리 절약과 성능 향상이 가능하지만, 설계 복잡도와 관리 비용도 증가할 수 있으니 주의해야 한다.

### 추가 학습: Patterns.dev의 예시 코드와 비교

```ts
class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }
}

const books = new Map();

const createBook = (title, author, isbn) => {
  const existingBook = books.has(isbn);

  if (existingBook) {
    return books.get(isbn);
  }

  const book = new Book(title, author, isbn);
  books.set(isbn, book);

  return book;
};

const bookList = [];

const addBook = (title, author, isbn, availability, sales) => {
  const book = {
    ...createBook(title, author, isbn),
    sales,
    availability,
    isbn,
  };

  bookList.push(book);
  return book;
};
```

> 예시 코드의 문제점

- `...createBook(...)`로 인스턴스를 펼치면 새로운 객체가 만들어져서 공유가 깨진다. 프로토타입 메서드와 정체성도 사라지기 때문에 동일 인스턴스를 재사용하는 의도가 무력화된다.
- `Book` 클래스가 갖는 `title`, `author`, `isbn`은 공유 상태(intrinsic)로 관리해야 하고, `availability`와 `sales`는 개별 상태(extrinsic)로 분리해야 메모리 절감 효과를 얻을 수 있다. (<코드 및 활용 예시>의 코드에서는 공유 상태는 참조를 통해 공유하고 있음)
- `isbn`은 이미 `Book` 인스턴스 안에 포함되어 있는데, 엔트리에도 중복으로 넣고 있다. 필요에 따라 유지할 수는 있지만, 의도적으로 중복을 두는 게 아니라면 불필요하다.

### 추가 학습: 자바스크립트의 프로토타입 상속과 Flyweight의 관계

> 1. 프로토타입 상속의 기본 아이디어

- 자바스크립트에서 모든 객체는 프로토타입 체인(prototype chain)을 통해 공통된 메서드와 속성을 공유한다.
- 예를 들어, 배열 인스턴스마다 `map`, `filter`, `reduce` 메서드가 따로 복사되어 들어있는 게 아니라, 모두 `Array.prototype`에 정의되어 있고, 각 배열 인스턴스는 참조만 한다.
- 즉, JS의 객체 모델 자체가 공통된 로직/속성을 공유하도록 설계되어 있어서, 많은 객체를 만들더라도 중복 메모리 사용이 줄어든다.

```ts
function Book(title, author, isbn) {
  this.title = title;
  this.author = author;
  this.isbn = isbn;
}

Book.prototype.getInfo = function () {
  return `${this.title} - ${this.author}`;
};

const a = new Book("Dune", "Frank Herbert", "9780441172719");
const b = new Book("Foundation", "Isaac Asimov", "9780553293357");

console.log(a.getInfo === b.getInfo); // true → 같은 함수 참조
```

- 위 코드처럼 getInfo는 인스턴스마다 새로 생성되지 않고, 모두 같은 함수 객체를 공유한다. 이게 사실상 Flyweight의 intrinsic 상태 공유와 같은 효과를 낸다.

> 2. 자바스크립트에서 Flyweight가 그리 중요하지 않은 이유

- Flyweight 패턴의 목적은 공통 상태(`intrinsic`)를 공유해서 메모리를 절약하는 것이다.
- 하지만 자바스크립트에서는 애초에 프로토타입 체계가 그 기능을 자동으로 수행한다.
- 따라서 "공유 상태를 별도 객체로 분리해 캐시에 보관"하는 전통적인 Flyweight 설계가 자주 필요하지 않다.

> 3. 자바스크립트에서 Flyweight이 의미 있는 경우

- 데이터 자체를 공유해야 할 때: 예를 들어 수십만 개의 텍스트 노드가 같은 글꼴/스타일 속성을 공유한다면, 그 속성을 `Font` 객체로 만들어 캐싱하고, 개별 문자는 해당 `Font` 객체 참조만 들고 있게 할 수 있다.
- 대규모 게임/시뮬레이션: 수천 개의 엔티티가 있을 때, 모델(mesh), 텍스처(texture) 같은 리소스를 `Flyweight`로 관리하면 메모리 효율이 커진다.
- 네트워크/데이터 캐싱: 동일한 요청이나 동일한 구조의 데이터가 반복되면 `Flyweight` 방식으로 메모리 절감을 노릴 수 있다.

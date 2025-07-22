# 02_proxy

https://patterns-dev-kr.github.io/design-patterns/proxy-pattern/



Proxy 객체는 특정 개체에 대한 동작을 중간에서 가로채어 그 객체에 작동하는 동작을 커스텀할 수 있습니다.

```js
const person = {
  name: 'John Doe',
  age: 42,
  nationality: 'American',
}

const personProxy = new Proxy(person, {})
```

프록시 객체의 인자는 타겟 객체와 그 핸들러로 구성되어 있습니다.

```js
const proxy = new Proxy(target, handler);
```

- target: 기존 객체
- Handler: 프록시의 동작을 정의하는 객체

### 타겟

- 객체 타입이어야 한다 

- 일반 객체 뿐 아니라 배열과 함수, 클래스 인스턴스도 객체 타입이기 때문에 가능하다

### 핸들러

#### 트랩

프록시의 동작을 의미하는 트랩들이 들어간다

- get : 프로퍼티 접근
- set : 프로퍼티 할당
- has : key 존재여부
- deleteProperty : key 삭제
- ownKeys : 반복문에서 호출
- apply : 함수로 호출될 때
- construct : 프록시 객체가 생성될 때
- defineProperty : 프로퍼티 정의
- getOwnPropertyDescriptor : 프로퍼티의 정보를 조회



#### 트랩별 인자 구성

| 트랩           | 인자                                             |
| -------------- | ------------------------------------------------ |
| get            | (target, prop, receiver)                         |
| set            | (target, prop, value, receiver)                  |
| has            | (target, prop)                                   |
| deleteProperty | (target, prop)                                   |
| ownKeys        | (target)                                         |
| apply          | (target, thisArg, args) → 함수 프록시용          |
| construct      | (target, args, newTarget) → 생성자 함수 프록시용 |



#### Reflect

reflect는 프록시에서 가로챌때 기존 해당 동작을 명시적으로 호출할 수 있는 객체이다

프록시에서 기본 동작에 override해서 다른 동작을 추가하고 싶을 때 해당 동작을 별도로 구현할 필요 없이 이 객체를 호출할 수 있다

```js
// get
obj[prop]
Reflect.get(target, prop);

// set
obj[prop] = value
Reflect.set(target, prop, value);

// delete
delete obj[prop]
Reflect.deleteProperty(target, prop);
```





## 실제 사용하는 경우

- 값 변화 로깅
- 유효성 검사
- API fetch 자동화
- 동적 다국어 처리
- 중복 작업 추상화
- this 컨텍스트 보호
- CLI/봇 명령 핸들링



### 유효성 검사

```js
const user = { age: 0 };

const userProxy = new Proxy(user, {
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('age는 숫자여야 합니다.');
    }
    return Reflect.set(target, prop, value);
  }
});

userProxy.age = 30;       // 정상
userProxy.age = '삼십';   // TypeError
```





### API fetch

```js
const api = new Proxy({}, {
  get(_, endpoint) {
    return async () => {
      const res = await fetch(`/api/${endpoint}`);
      return res.json();
    };
  }
});

api.users().then(console.log);   // /api/users 호출
api.posts().then(console.log);   // /api/posts 호출
```



### 중간 변환(다국어 번역)

```js
const dict = {
  hello: '안녕하세요',
};

const t = new Proxy(dict, {
  get(target, key) {
    return target[key] || `[${key}] 번역 없음`;
  }
});

console.log(t.hello); // '안녕하세요'
console.log(t.bye);   // '[bye] 번역 없음'
```






# Module 패턴

## 개요

 모듈 패턴은 하나의 진입접 객체를 통해 관련된 변수와 함수를 묶어 관리하여, 내부 구현을 스코프 안에 감추고 외부 노출할 API 만 반환하게하는 패턴입니다. 이렇게 되면, 진입접 객체를 제외한 내부 변수들은 이를 사용하는 외부에서 사용할 수 없게 됩니다.

## 왜 사용하나요?

 모듈 패턴은 프로그래밍 언어가 *모듈 기능을 지원하지 않을 때, 전역 네임스페이스의 오염을 방지*하기 위해 사용하는 디자인 패턴입니다. 네임스페이스를 지원하지 않는 언어에서 네임스페이스와 같은 변수 접근 제어를 구현하기 위해 사용합니다.

## ES6 이전 JS 의 모듈 패턴

 ES6 이후의 JS 는 모듈 기능을 지원(네임스페이스 구분 기능 지원)하기 때문에 언어적으로 편리하게 모듈 패턴을 사용할 수 있지만, ES6 이전 JS 는 모듈을 지원하지 않아서 클로저를 이용해 네임스페이스 구분을 했었습니다. 예전 JS 자료들을 읽다보면 자주 보이는 그 유명한 IIFE(Immediately Invoked Function Expresstion) 가 모듈 패턴을 구현하는 핵심 도구였습니다.

```tsx
var CounterModule = (function () {
  // private
  var count = 0;

  function changeBy(val) {
    count += val;
  }

  // public API
  return {
    increment: function () { changeBy(1); },
    decrement: function () { changeBy(-1); },
    value: function () { return count; }
  };
})();

CounterModule.increment();
console.log(CounterModule.value()); // 1
console.log(CounterModule.count);   // undefined (private)
```

## 현재 JS 의 모듈

 현재 JS 에서는 모듈 기능을 자체적으로 지원(ESM)해줍니다. 모듈 기능은 엔진 내부적으로 지원하는 기능으로, IIFE 형태로 변환되는 것이 아닙니다. JS 엔진이 모듈을 해석할 때는 모듈 스코프 기준으로 실행 컨텍스트가 생성됩니다. (렉시컬 환경이 모듈 스코프)

- 그렇다면 CommonJS 나 AMD 같은 구버전 모듈 지원 방식은 어떻게 구현했던 것 인가요?
    
    CommonJS: 런타임에서 IIFE 로 래핑
    
    AMD: 외부 라이브러리 (RequireJS) 사용하여 구현
    

```tsx
const privateValue = 'This is a value private to the module!'

export function add(x, y) {
  return x + y
}

export function multiply(x) {
  return x * 2
}

export function subtract(x, y) {
  return x - y
}

export function square(x) {
  return x * x
}
```

```tsx
import { add, multiply, subtract, square } from './math.js'

console.log(privateValue)
```

이외에 export 된 변수 이름이 로컬 변수와 겹칠 때는 as 로 이름을 재정의 할 수도 있습니다.

```tsx
import {
  add as addValues,
  multiply as multiplyValues,
  subtract,
  square,
} from './math.js'

function add(...args) {
  return args.reduce((acc, cur) => cur + acc)
}

function multiply(...args) {
  return args.reduce((acc, cur) => cur * acc)
}

/* From math.js module */
addValues(7, 8)
multiplyValues(8, 9)
subtract(10, 3)
square(3)

/* From index.js file */
add(8, 9, 2, 10)
multiply(8, 9, 2, 10)
```

### export default

 export default 를 통해 모듈 객체를 export 하는 것은 모듈당 하나만 가능하며, 이는 모듈이 *하나의 주된 기능을 제공할 때 의미론적으로 표현하기 위해 사용합니다.* 

```tsx
// 📁 user.js
export default class User { // export 옆에 'default'를 추가해보았습니다.
  constructor(name) {
    this.name = name;
  }
}
```

```tsx
/ 📁 main.js
import User from './user.js'; // {User}가 아닌 User로 클래스를 가져왔습니다.

new User('John');
```

```tsx
export default function add(x, y) {
  return x + y
}

export function multiply(x) {
  return x * 2
}

export function subtract(x, y) {
  return x - y
}

export function square(x) {
  return x * x
}
```

```tsx
export default { add, multiply }
```

 심지어 위와 같은 `export default { add, multiply }` 방식은 트리쉐이킹 관점에서 불리합니다. export 만 하면 트리쉐이킹 시 import 받지 않은 것은 함께 번들링 되지 않지만, export default 시 모든 것을 다 번들링 하기 때문에, 번들 크기가 불필요하게 커질 수 있습니다.

---

[변수의 유효범위와 클로저](https://ko.javascript.info/closure)

실행컨텍스트 관련 출처

[Module pattern](https://en.wikipedia.org/wiki/Module_pattern)

모듈패턴 정의 출처

[Scope - Glossary | MDN](https://developer.mozilla.org/en-US/docs/Glossary/Scope)

스코프 관련 출처
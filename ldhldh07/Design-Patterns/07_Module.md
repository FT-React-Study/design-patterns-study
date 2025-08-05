# Module

모듈 패턴은 파일 내부에 구현을 캡슐화할 수 있는 패턴이다.



모듈 스코프를 가지고 그 안에서 선언된 변수, 함수, 클래스 등은 export를 통해서만 외부로 노출된다.





## JS ES2015의 빌트인 모듈

### 즉시 실행 함수 기반 모듈

```ts
const CounterModule = (function () {
  // private 변수
  let count = 0

  // public API
  return {
    increment() {
      count++
      console.log(count)
    },
    reset() {
      count = 0
      console.log('Reset!')
    }
  }
})()

CounterModule.increment() // 1
CounterModule.increment() // 2
CounterModule.reset()     // Reset!
```

### ES6 빌트인 모듈

```ts
// utils.js
export function sum(a, b) {
  return a + b
}

export const PI = 3.14
```

```ts
import { add } from './mathUtils.js'

console.log(add(2, 3))     // 5
console.log(secret)        // ReferenceError
```

#### 특징

파일 단위로 스코프를 가진다

lazy Loading 지원

네임 스페이스 충돌하는 경우를 방지할 수 있다

- export를 사용하지 않은 경우 접근할 수 없다

- import시 as 키워드를 통해 import한 값의 변수명을 조작할 수 있다

```ts
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



#### export default

Export한 선언들 중 하나를 default export할 수 있다

default export한 경우 named export와 달리 대괄호 없이 import 가능하다

```ts
// named export
export const PI = 3.14159

// default export
export default function add(a, b) {
  return a + b
}
```

```ts
// default export는 대괄호 없이 import
import add from './math.js'

// named export는 대괄호 필요
import { PI } from './math.js'

console.log(add(2, 3)) // 5
console.log(PI)        // 3.14159
```



#### Dynamic Import (import())

ES2020에서 표준화

모듈을 런타임 시점에 비동기적으로 가져온다

Promise 객체를 반환한다

```ts
import('경로').then((module) => {
  // module 안에 export된 항목들에 접근 가능
  module.함수명()
})
```

```ts
const module = await import('./utils.js')
module.someFunction()
```



#### 특징

파일의 맨 위에서 import하는 기존 모듈과 달리 원하는 시점에 작성해서 그 시점에 비동기적으로 모듈을 호출한다

```ts
// 조건이 맞을 때만 모듈 로딩
async function calculate() {
  if (Math.random() > 0.5) {
    const math = await import('./math.js')
    console.log(math.multiply(2, 3))
  } else {
    console.log('모듈 로딩 안 함')
  }
}

calculate()
```





## 장점

유지 보수가 용이하다

테스트가 용이하다

네임스페이스 충돌을 방지할 수 있다.
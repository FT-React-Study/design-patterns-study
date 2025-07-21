# Singleton 객체

https://patterns-dev-kr.github.io/design-patterns/singleton-pattern/

싱글톤 객체는 인스턴스를 하나만 생성하여 전역적으로 사용하기 위한 객체이다.

하나의 기능을 하는 인스턴스를 프로젝트 전체에서 공유하게 되는 경우에 사용해왔다.

```js
class WebSocketManager {
  constructor() {
    if (WebSocketManager._instance) {
      return WebSocketManager._instance;
    }
    this.socket = null;
    WebSocketManager._instance = this;
  }

  connect() {
    if (!this.socket) {
      this.socket = new WebSocket('wss://server.com');
    }
    return this.socket;
  }
}

export default new WebSocketManager();
```

싱글톤 객체는 인스턴스를 하나로 하기 위해 instance라는 변수를 만들고, 이미 인스턴스가 한번 생성되어 이 변수에 할당했을 때는 다시 생성하지 못하도록 한다.

```js
    if (WebSocketManager._instance) {
      return WebSocketManager._instance;
    }
```





## object.freeze()

자바스크립트에서 객체를 수정할 수 없도록 하는 메소드이다.

싱글톤 객체에 사용시, 객체가 의도치 않도록 변경되는 것을 방지하고 전역 상태에서 발생할 수 있는 예측하기 힘든 사이드 이펙트를 방지한다.

```js
const config = Object.freeze({
  API_BASE_URL: 'https://api.example.com',
  TIMEOUT: 5000,
});
```

이처럼 변경되어서는 안되는 객체 선언시 사용된다.



## 자바스크립트에서는 안티패턴인 이유

[자바스크립트 ES2015](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules?)에서 `module` 시스템이 싱글톤과 유사하게 동작한다.

import된 모듈을 로드한 후 캐시하여 전역적으로 하나의 인스턴스를 공유한다.

```js
// counter.js
let count = 0;

export function increment() {
  count++;
}

export function getCount() {
  return count;
}
```

```js
// 첫번째 파일
import { increment, getCount } from './counter.js';
increment();
console.log(getCount()); // 1
```

```js
import { increment, getCount } from './counter.js';
console.log(getCount()); // 1 (같은 count 공유됨)
increment();
console.log('[B] count:', getCount()); // 2
```

이처럼 각각 counter.js를 import할 경우 같은 count를 공유한다.



상단에서 구현한 socket 또한 모듈 시스템과 객체 리터럴을 이용해 구현할 시

```js
let socket = null;

function connect() {
  if (!socket) {
    socket = new WebSocket('wss://server.com');
  }
  return socket;
}

export default {
  connect,
};
```

간단하게 구현된다.

그렇기 때문에 자바스크립트에서는 싱글톤 패턴을 별도로 구현하는 것은 불필요할 수 있어 안티패턴으로 여겨진다.





### 그럼에도 필요한 상황

#### 초기화 시점을 조절하고 싶을 때

ES 모듈은 import 시점에 코드가 실행되므로 인스턴스가 즉시 초기화된다.

그러나 어떤 경우에는 실제로 기능이 필요할 때까지 인스턴스 생성을 미뤄야 한다.

```js
let instance;

export function getInstance() {
  if (!instance) {
    instance = createExpensiveResource();
  }
  return instance;
}
```

이같은 lazy init 패턴이 필요할땐 싱글톤 패턴으로 인스턴스 시점을 조절할 수 있다.



#### 인스턴스를 외부에서 주입받아 교체할 수 있어야 할 때

인스턴스를 여러 환경에 따라 바꿔야 하는 상황도 요구된다.

특히 dev prod 환경에 따라 다른 인스턴스를 활용할 때 활용된다.

```js
// api.js
let client;

export function setApiClient(c) {
  client = c;
}

export function get(path) {
  return client.get(path);
}
```

```js
// setup.js
import { setApiClient } from './api.js';

import axios from 'axios';

const realClient = axios.create({
  baseURL: process.env.API_BASE_URL,
});

setApiClient(realClient);
```


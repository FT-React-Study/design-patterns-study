# Observer

> 특정 객체(Subject)의 상태 변화가 발생했을 때, 이를 감지하고 자동으로 구독자(Observer)들에게 통지하는 구조

- 상태 변경 감지 자동화

  → 특정 객체의 변화가 발생하면 수동 호출 없이 관련 객체들이 자동으로 반응

- 느슨한 연결 (Loose Coupling)

  → Subject는 자신을 구독하는 객체들이 *누군지, 몇 명인지* 알 필요 없음

- 상태 관리와 이벤트 시스템에 적합

  → 전역 상태, UI 동기화, 실시간 처리 등에 유리함



```js
class Subject {
  private observers: Function[] = []

  subscribe(observer: Function) {
    this.observers.push(observer)
  }

  unsubscribe(observer: Function) {
    this.observers = this.observers.filter(fn => fn !== observer)
  }

  notify(data: any) {
    this.observers.forEach(fn => fn(data))
  }
}
```



```js
const subject = new Subject()

subject.subscribe((data) => {
  console.log('받은 데이터:', data)
})

subject.notify('hello') // 받은 데이터 : hello
```

notify()가 호출되면 알람이 전파된다



### ReactiveX

대표적으로 옵저버 패턴을 구현한 API

주요 빌트인 요소

| **개념**      | **설명**                                            |
| ------------- | --------------------------------------------------- |
| Subject       | Observer와 Observable의 역할을 동시에 수행          |
| next()        | 새로운 데이터를 observer에게 전달                   |
| pipe()        | 연산자를 연결해 데이터 흐름을 조작 (filter, map 등) |
| subscribe()   | 옵저버 등록                                         |
| unsubscribe() | 옵저버 해제                                         |



```js
import { Subject } from 'rxjs'

const subject = new Subject<string>()

subject.subscribe(data => {
  console.log('Observer 1:', data)
})

subject.subscribe(data => {
  console.log('Observer 2:', data)
})

subject.next('데이터 도착!')
```

```js
import { Subject } from 'rxjs'
import { filter, map } from 'rxjs/operators'

const subject = new Subject<number>()

subject
  .pipe(
    filter((n) => n % 2 === 0),
    map((n) => n * 10)
  )
  .subscribe(result => console.log('결과:', result))

subject.next(1)  // 아무 일도 없음 (filter에서 걸림)
subject.next(2)  // 출력: 결과: 20
```





### 사용처

- 브라우저의 addEventListener
- React 상태 관리 / Redux / Recoil (구독 기반 구조)
- Vue의 반응형 시스템 (ref, watch)
- RxJS 기반 UI 시스템 (Angular, 비동기 flow 처리 등)
- 소켓 통신 / Pub-Sub 구조 / WebSocket
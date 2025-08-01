# Observer Pattern

> 특정 객체(Subject)의 상태 변화가 발생했을 때, 이를 자동으로 구독자(Observer)들에게 전파하는 패턴



- 상태 변경 감지 자동화
  - 수동 호출 없이 관련 객체들이 자동으로 반응
- 느슨한 결합 (Loose Coupling)
  - Subject는 자신을 구독한 Observer들의 존재나 수에 대해 알 필요 없음
- 상태 관리와 이벤트 시스템에 적합
  - 전역 상태, UI 동기화, 실시간 데이터 처리 등에서 유리함

------



### 구성

| 구성요소     | 설명                                                  |
| ------------ | ----------------------------------------------------- |
| **Subject**  | 상태를 가지고 있고, 상태가 변경되면 Observer에게 알림 |
| **Observer** | Subject를 구독하고 있다가, 상태 변경 시 알림을 받음   |

```ts
class Subject {
  private observers: Function[] = [];

  subscribe(observer: Function) {
    this.observers.push(observer);
  }

  unsubscribe(observer: Function) {
    this.observers = this.observers.filter(fn => fn !== observer);
  }

  notify(data: any) {
    this.observers.forEach(fn => fn(data));
  }
}

const subject = new Subject();

subject.subscribe((data) => {
  console.log('Observer 1:', data);
});

subject.notify('hello');
// 출력: Observer 1: hello
```

------



## RxJS를 통한 Observer 구현

RxJS는 Observer 패턴을 고수준 API로 구현한 대표 라이브러리다.

```ts
import { Subject } from 'rxjs';

const subject = new Subject<string>();

subject.subscribe(data => {
  console.log('Observer 1:', data);
});

subject.subscribe(data => {
  console.log('Observer 2:', data);
});

subject.next('데이터 도착!');
// 출력:
// Observer 1: 데이터 도착!
// Observer 2: 데이터 도착!
```

#### 연산자 (`pipe`, `filter`, `map` 등)

```ts
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const subject = new Subject<number>();

subject
  .pipe(
    filter((n) => n % 2 === 0),
    map((n) => n * 10)
  )
  .subscribe(result => console.log('결과:', result));

subject.next(1); // 아무 일도 없음
subject.next(2); // 출력: 결과: 20
```



#### 많이 쓰이는 경우

| 분야               | 예시                                           |
| ------------------ | ---------------------------------------------- |
| **DOM 이벤트**     | `addEventListener`                             |
| **상태 관리**      | Redux store.subscribe, Recoil의 구독 기반 구조 |
| **UI 프레임워크**  | Vue의 `ref`, `watch`, React의 `useEffect`      |
| **RxJS 기반 앱**   | Angular, RxJS 스트림 처리                      |
| **실시간 통신**    | WebSocket, Pub/Sub 구조                        |
| **전역 상태 공유** | observer 패턴 기반 전역 상태 공유 유형         |
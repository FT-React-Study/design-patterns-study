# Factory

팩토리는 객체를 생성할 수 있는 함수입니다.



## Factory로 객체를 생성하는 이유

복잡도가 높은 객체를 함수의 인자로 설정값을 받아서 비교적 간단하게 생성하고자 할 때 사용한다.



### 경우 - 기본값이 존재하고 특정값만 바꾼 객체가 필요하다

```ts
export function makeEvent(overrides: Partial<Event> = {}): Event {
  const base: Event = {
    id: 'e0',
    title: '테스트 이벤트',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  return {
    ...base,
    ...overrides,
    repeat: { ...base.repeat, ...(overrides.repeat ?? {}) },
  };
}

```

사용 사례

```ts
    const base = makeEvent({
      id: 'e5',
      title: 'Weekly',
      date: '2025-01-01', // 수요일
      repeat: { type: 'weekly', interval: 1, endDate: '2025-01-30' },
    });
```

기본값에서 변화하는 값이 있는 경우에만 인자로 override 값을 넣어서 생성한다.



### 객체 생성에 복잡한 계산 로직이 있는 경우

```ts
function makeUser(overrides: Partial<User> = {}): User {
  const now = new Date().toISOString();
  const base: User = {
    id: crypto.randomUUID(),
    name: 'Anonymous',
    createdAt: now,
    updatedAt: now,
  };
  return { ...base, ...overrides };
}
```

타임스탬프 부여 혹은 uuid 생성과 같은 가공/계산 로직을 팩토리 내부에 감출 수 있다



### 의존성 주입

```ts
function makeApiClient(config: ApiConfig) {
  return {
    getUser: (id: string) => fetch(`${config.baseUrl}/users/${id}`),
  };
}

const client = makeApiClient({ baseUrl: 'https://api.example.com' });
```

Base URL, 인증 토큰 등 특정한 서비스를 주입받는 형태로도 사용된다.



### 정리

- Factory는 클래스가 없어도 객체를 만들 수 있는 함수적 방식
- 특히 JS/TS 환경에서는 클래스보다 함수형 접근이 더 간단하다

new를 이용한 객체 생성은 모든 속성를 작성해야 한다.

이 단점을 최소화하고, 함수의 유연성으로 중복되는 설정이나, 직관적으로 이해하기 쉬운 함수 생성을 유도할 때 필요하다.
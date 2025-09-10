# [Hooks 패턴](https://patterns-dev-kr.github.io/design-patterns/hooks-pattern/)

## Hook 패턴의 일반적 정의

Hook이란 시스템의 특정 지점에 "걸어서" 동작을 확장하거나 가로채는 메커니즘입니다.

### Hook 패턴의 공통 특징
- 확장점 제공: 기존 시스템을 수정하지 않고 기능 확장
- 생명주기 개입: 특정 이벤트나 시점에 사용자 정의 로직 실행
- 느슨한 결합: Hook을 등록/해제할 수 있는 유연한 구조

### Observer 패턴과 Event Emitter와의 관계

Hook 패턴은 Observer 패턴의 특수한 형태로 볼 수 있습니다. 둘 다 이벤트 기반으로 동작하지만 약간의 차이가 있습니다.

```javascript
// Observer 패턴 - 상태 변경 알림에 초점
class Subject {
  constructor() {
    this.observers = [];
  }
  
  attach(observer) {
    this.observers.push(observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Hook 패턴 - 시스템 확장점에 초점
class HookManager {
  constructor() {
    this.hooks = new Map();
  }
  
  addHook(event, callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(callback);
  }
  
  executeHooks(event, context) {
    const callbacks = this.hooks.get(event) || [];
    callbacks.forEach(callback => callback(context));
  }
}

// Event Emitter - Node.js 스타일의 이벤트 시스템
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.on('data', (data) => {
  console.log('Data received:', data);
});

myEmitter.emit('data', { message: 'Hello World' });
```

주요 차이점:
- Observer: 객체 간의 의존성과 상태 변경 전파에 중점
- Hook: 시스템의 특정 지점에서 확장 가능한 동작 실행에 중점
- Event Emitter: 비동기 이벤트 기반 통신과 decoupling에 중점

### 다양한 Hook 구현 예시

```javascript
// Git hooks - 커밋 전후 스크립트 실행
// .git/hooks/pre-commit
#!/bin/sh
npm run lint && npm run test

// Webpack hooks - 빌드 과정에 플러그인 개입
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('MyPlugin', (compilation) => {
      console.log('Building assets...');
    });
  }
}

// Express middleware - 요청/응답 사이클에 개입
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // 다음 미들웨어로 제어 전달
});

// Vue.js lifecycle hooks - 컴포넌트 생명주기에 개입
export default {
  mounted() {
    console.log('Component mounted');
  },
  beforeDestroy() {
    console.log('Cleanup before destroy');
  }
}

// Node.js process hooks - 프로세스 이벤트에 개입
process.on('SIGINT', () => {
  console.log('Graceful shutdown...');
  server.close();
});

// Database hooks/triggers - 데이터 변경 시점에 개입
// CREATE TRIGGER audit_log AFTER UPDATE ON users
//   FOR EACH ROW BEGIN
//     INSERT INTO audit_log(user_id, action) VALUES(NEW.id, 'UPDATE');
//   END;
```

### Hook 패턴의 실제 구현

```javascript
// 간단한 Hook 시스템 구현
class HookSystem {
  constructor() {
    this.hooks = new Map();
  }

  // Hook 등록
  addHook(event, callback) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(callback);
  }

  // Hook 실행
  executeHooks(event, data) {
    const callbacks = this.hooks.get(event) || [];
    return callbacks.reduce((result, callback) => {
      return callback(result) || result;
    }, data);
  }
}

// 사용 예시
const system = new HookSystem();
system.addHook('beforeSave', (data) => {
  console.log('Validating data...');
  return { ...data, validated: true };
});

system.addHook('beforeSave', (data) => {
  console.log('Adding timestamp...');
  return { ...data, timestamp: Date.now() };
});

// Hook 실행
const result = system.executeHooks('beforeSave', { name: 'John' });
// { name: 'John', validated: true, timestamp: 1234567890 }
```

## React Hooks 패턴

React Hooks는 함수 컴포넌트에서 상태와 생명주기 로직을 "걸어서" 사용할 수 있게 하는 메커니즘입니다.

### 정의
- 함수 컴포넌트에서 상태ful 로직을 재사용하기 위한 메커니즘
- Custom Hook으로 비주얼(UI)과 비즈니스 로직을 분리하여 조합 가능

## 특징

- 입력: 매개변수(초깃값/옵션), 출력: 값/함수 묶음
- 클로저/의존성 배열을 이용한 메모이제이션과 이펙트 제어
- 컴포넌트 트리 구조에 영향 없이 로직만 공유

## Custom Hook 시그니처

```ts
function useSomething(params?: Options): ReturnValue;
```

## 기본 예시: useToggle

```tsx
import { useCallback, useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState<boolean>(initial);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return { value, on, off, toggle };
}

// 사용
// const { value, toggle } = useToggle();
```

## 상태/이펙트 다루기

- 의존성 배열은 외부 참조를 명시적으로 관리하여 일관성 유지
- 비동기 작업은 취소/정리(cleanup)를 동반해 누수 방지
- 메모이제이션: `useMemo`/`useCallback`으로 값과 핸들러 안정화

## 공통 이슈와 해결

- ESLint rules of hooks 준수: 호출 순서/조건부 호출 금지
- 컨텍스트 분리: Context + Hook 조합으로 전역 상태/주입 구현
- 성능: 불변성 유지, 선택적 리렌더링, 분할 컴포넌트 전략 적용

## Hook 패턴의 일반적 장단점

### 장점
- 확장성: 기존 코드 변경 없이 새로운 기능 추가
- 모듈성: 독립적인 Hook들을 조합하여 복잡한 동작 구성
- 재사용성: 동일한 Hook을 여러 곳에서 활용 가능
- 관심사 분리: 핵심 로직과 부가 기능을 분리

### 단점
- 복잡성 증가: Hook이 많아지면 실행 순서와 의존성 추적 어려움
- 디버깅 어려움: 여러 Hook이 연쇄적으로 실행될 때 문제 지점 파악 곤란
- 성능 오버헤드: Hook 시스템 자체의 런타임 비용

## React Hooks의 특별한 장단점

### 장점
- 로직 재사용이 간결하고 명시적
- 테스트 용이성: 순수 함수 형태로 단위 테스트 쉬움
- 컴포넌트 트리 단순화: HOC/Render Props 대비 중첩 감소

### 단점
- 의존성 관리 실수로 인한 버그 가능
- 숨은 공유 상태 설계 시 주의 필요(Context 과사용 등)
- 학습 곡선: Rules of Hooks, 의존성 배열 등 새로운 개념

## HOC / Render Props와 비교

- HOC: 주입 경로가 암묵적일 수 있음, 트리 가독성 저하 우려
- Render Props: 유연하지만 중첩 렌더링으로 복잡도 증가 가능
- Hooks: 가장 간결한 로직 공유, 트리 영향 최소화

## Hook 패턴이 유용한 상황

### 일반적인 경우
- 플러그인 시스템: 서드파티 확장 기능 지원
- 이벤트 기반 아키텍처: 특정 시점에 여러 핸들러 실행
- AOP(Aspect-Oriented Programming): 횡단 관심사(로깅, 보안, 캐싱) 처리
- 파이프라인 처리: 데이터 변환/검증 단계별 Hook 적용

### React Hooks 특화 상황
- 상태 로직 재사용: 여러 컴포넌트에서 동일한 상태 패턴 사용
- 비즈니스 로직 분리: UI와 독립적인 로직을 Hook으로 추출
- 라이프사이클 관리: 컴포넌트 마운트/언마운트 시 리소스 관리

## 안티패턴/주의사항

### 일반적인 Hook 패턴
- Hook 지옥: 너무 많은 Hook으로 인한 복잡성 증가
- 순환 의존성: Hook끼리 서로 호출하여 무한 루프 발생
- 성능 무시: Hook 실행 비용을 고려하지 않은 과도한 사용

### React Hooks 특화
- 조건부/루프 내 Hook 호출 금지
- Hook에서 동기 부수효과 사용 자제, cleanup 철저히
- 지나친 추상화(과도한 작은 Hook 분리)로 가독성 저하 주의

## 참고자료

- React 공식 문서 - Hooks
- eslint-plugin-react-hooks

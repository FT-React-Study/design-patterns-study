# Observer 패턴

## 개요

 Observer 패턴은 객체간의 상호작용을 구분하는 방법 중에 하나입니다. 일반적으로 Observable 객체가 구독할 정보를 제공하고, 구독자를 관리하는 주체로 표현되며, 이 구독을 한 객체들을 Observer 라고 표현 합니다. 그래서 Observable 이 Observer 들에게 특정 이벤트가 생겨 났을 때 자신이 관리하는 상태들을 전파하는 패턴입니다.

 이 패턴이 발전하여 Pub/Sub 패턴 등 구독관련 패턴들이 생겨나게 됩니다.

## 왜 사용하나요?

 상태 변화의 주체를 하나로 두고 의존 객체들을 자동으로 업데이트 하게 하려는 것으로 객체간 느슨한 결합을 위해 사용합니다.

## 패턴 구조

- observable: 구독할 수 있는 객체
    - subscribe: observable 을 구독하도록 하는 메서드
    - unsubscribe: 구독을 취소하는 메서드
    - notify: 구독한 observer 들에게 알리는 메서드
- observer: observable 의 subscribe 메서드를 통해 observable 객체의 변화를 구독한 객체
    - update: observable 의 변화를 감지해 받아들일 수 있도록 하는 메서드

## 활용

### 예시

```tsx
import type { SyntheticEvent } from "react";

interface Observer<T> {
    update(data: T): void;
}

abstract class Observable<T> {
    protected observers: Observer<T>[] = [];
    abstract subscribe(observer: Observer<T>): void;
    abstract unsubscribe(observer: Observer<T>): void;
    abstract notify(data: T): void;
}

class ObservableEvent<T extends SyntheticEvent> extends Observable<T> {
    subscribe(observer: Observer<T>): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: Observer<T>): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

		// notify 메서드에서 observer 의 update 를 호출해 상태들을 업데이트 해줍니다.
    notify(data: T): void {
        this.observers.forEach(observer => observer.update(data));
    }
}

class EventObserver<T extends SyntheticEvent> implements Observer<T> {
    private callback: (data: T) => void;

    constructor(callback: (data: T) => void) {
        this.callback = callback;
    }

    update(data: T): void {
        this.callback(data);
    }
}

export { ObservableEvent, EventObserver };
```

```tsx
import type { SyntheticEvent } from "react";
import type { Observer } from "../class/observer";

interface LogEntry {
    timestamp: Date;
    eventType: string;
    target: string;
    data: EventData;
}

interface EventData {
    type: string;
    timeStamp: number;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    [key: string]: unknown;
}

export class Logger implements Observer<SyntheticEvent> {
    private static instance: Logger;
    private logs: LogEntry[] = [];

    private constructor() {}

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    update(event: SyntheticEvent): void {
        const logEntry: LogEntry = {
            timestamp: new Date(),
            eventType: event.type,
            target: this.getTargetInfo(event.target),
            data: this.extractEventData(event)
        };

        this.logs.push(logEntry);
        this.printLog(logEntry);
    }

    private getTargetInfo(target: EventTarget | null): string {
        if (!target) return 'unknown';
        
        const element = target as HTMLElement;
        const tagName = element.tagName?.toLowerCase() || 'unknown';
        const id = element.id ? `#${element.id}` : '';
        const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
        
        return `${tagName}${id}${className}`;
    }

    private extractEventData(event: SyntheticEvent): EventData {
        const { type, timeStamp, bubbles, cancelable, defaultPrevented } = event;
        
        // 이벤트 타입별로 추가 데이터 추출
        const additionalData: Record<string, unknown> = {};
        
        if (event.type === 'click' || event.type === 'mousedown' || event.type === 'mouseup') {
            const mouseEvent = event as React.MouseEvent;
            additionalData.clientX = mouseEvent.clientX;
            additionalData.clientY = mouseEvent.clientY;
            additionalData.button = mouseEvent.button;
        }
        
        if (event.type === 'change' || event.type === 'input') {
            const target = event.target as HTMLInputElement;
            additionalData.value = target.value;
        }
        
        if (event.type.startsWith('key')) {
            const keyEvent = event as React.KeyboardEvent;
            additionalData.key = keyEvent.key;
            additionalData.code = keyEvent.code;
        }

        return {
            type,
            timeStamp,
            bubbles,
            cancelable,
            defaultPrevented,
            ...additionalData
        };
    }

    private printLog(logEntry: LogEntry): void {
        const { timestamp, eventType, target, data } = logEntry;
        const timeStr = timestamp.toLocaleTimeString('ko-KR', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3 
        });
        
        console.group(`🎯 [${timeStr}] ${eventType.toUpperCase()} Event`);
        console.log(`📍 Target: ${target}`);
        console.log(`📊 Data:`, data);
        console.groupEnd();
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
        console.clear();
        console.log('🧹 Logger: All logs cleared');
    }

    getLogsSummary(): Record<string, number> {
        return this.logs.reduce((summary, log) => {
            summary[log.eventType] = (summary[log.eventType] || 0) + 1;
            return summary;
        }, {} as Record<string, number>);
    }
}
```

```tsx
import { useState, useEffect, type SyntheticEvent } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ObservableEvent, EventObserver } from './shared/class/observer'
import { Logger } from './shared/utils/logger'

// 전역 이벤트 옵저버블 생성
const globalEventObservable = new ObservableEvent<SyntheticEvent>();

function App() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [logSummary, setLogSummary] = useState<Record<string, number>>({})

  useEffect(() => {
    // Logger를 옵저버로 등록
    const logger = Logger.getInstance();
    const loggerObserver = new EventObserver<SyntheticEvent>((event) => {
      logger.update(event);
      // 로그 요약 업데이트
      setLogSummary(logger.getLogsSummary());
    });

    globalEventObservable.subscribe(loggerObserver);

    return () => {
      globalEventObservable.unsubscribe(loggerObserver);
    };
  }, []);

  // 모든 이벤트를 캐치하는 핸들러
  const handleEvent = (event: SyntheticEvent) => {
    globalEventObservable.notify(event);
  };

  const handleClearLogs = () => {
    Logger.getInstance().clearLogs();
    setLogSummary({});
  };

  return (
    <div onClick={handleEvent} onKeyDown={handleEvent} onChange={handleEvent}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>디자인 패턴 실습: Observer Pattern + Logger</h1>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* 다양한 이벤트 테스트 영역 */}
      <div className="demo-section">
        <h2>🎯 이벤트 로깅 테스트</h2>
        
        <div className="input-section">
          <input
            type="text"
            placeholder="여기에 입력해보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="button-section">
          <button onMouseDown={() => console.log('Mouse down!')}>
            Mouse Down 테스트
          </button>
          <button onMouseUp={() => console.log('Mouse up!')}>
            Mouse Up 테스트
          </button>
          <button onDoubleClick={() => console.log('Double clicked!')}>
            Double Click 테스트
          </button>
        </div>

        <div className="keyboard-section">
          <input
            type="text"
            placeholder="키보드 이벤트 테스트"
            onKeyDown={(e) => console.log(`Key pressed: ${e.key}`)}
          />
        </div>
      </div>

      {/* 로그 요약 */}
      <div className="log-summary">
        <h3>📊 이벤트 로그 요약</h3>
        <button onClick={handleClearLogs} style={{ marginBottom: '10px' }}>
          🧹 로그 지우기
        </button>
        {Object.entries(logSummary).length === 0 ? (
          <p>아직 로그된 이벤트가 없습니다. 위의 요소들과 상호작용해보세요!</p>
        ) : (
          <ul>
            {Object.entries(logSummary).map(([eventType, count]) => (
              <li key={eventType}>
                <strong>{eventType}</strong>: {count}회
              </li>
            ))}
          </ul>
        )}
        <p className="log-note">
          💡 개발자 도구의 콘솔을 확인하여 상세한 로그를 확인하세요!
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

```

```tsx
import { makeObservable, observable, computed, action, flow } from "mobx"

class Doubler {
    value

    constructor(value) {
        makeObservable(this, {
            value: observable,
            double: computed,
            increment: action,
            fetch: flow
        })
        this.value = value
    }

    get double() {
        return this.value * 2
    }

    increment() {
        this.value++
    }

    *fetch() {
        const response = yield fetch("/api/value")
        this.value = response.json()
    }
}
```

 MobX 에서의 상태관리는 Observer 패턴을 기반으로 구현이 되어있어, MobX 라이브러리의 내부 상태 관리는 동기적으로 진행 됩니다.

## 단점

### 동기적인 처리로 인한 성능 병목 가능성

 Observable 객체가 모든 Observer 들을 받아서 동기적으로 notify 하기 때문에, Observer 의 update 함수가 무거운 로직을 담고 있다면, 성능적인 문제가 생길 수 있습니다.
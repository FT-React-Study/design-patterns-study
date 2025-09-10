import { useState, useEffect, type SyntheticEvent } from 'react'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { EventObserver, Logger, ObservableEvent } from '@/shared';
import { AuthenticatedProfile } from '@/feature';

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
    <div onClick={handleEvent} onKeyDown={handleEvent} onChange={handleEvent}><div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>디자인 패턴 실습: Observer Pattern + Logger</h1>
      
      <AuthenticatedProfile user={{
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com'
      }} />

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

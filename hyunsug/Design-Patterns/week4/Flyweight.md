# Flyweight Pattern 학습 정리

## 개요

- 플라이웨이트(Flyweight) 패턴은 구조적 디자인 패턴 중 하나
- 메모리 사용량을 최소화하기 위해 유사한 객체들 간에 공통 데이터를 공유하는 패턴

## 패턴의 목적

- 다수의 유사한 객체를 생성할 때 메모리 사용량 감소
- 객체의 공통 속성을 재사용하여 리소스 최적화
- 대량의 객체 생성이 필요한 시스템에서 성능 향상

## 핵심 개념

### 1. Intrinsic State (내재적 상태)

- 여러 객체가 공유하는 불변의 데이터
- 플라이웨이트 객체 내부에 저장
- 예: 문자의 폰트, 색상, 크기 등

### 2. Extrinsic State (외재적 상태)

- 각 객체마다 고유한 변경 가능한 데이터
- 플라이웨이트 외부에서 전달되는 매개변수
- 예: 문자의 위치, 좌표 등

## From Gang of Four?

### 배경

- 1994년 "Design Patterns: Elements of Reusable Object-Oriented Software"에서 처음 소개
- Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (GoF)가 정의
- 23개의 고전적인 디자인 패턴 중 하나

### 전통적인 구현 특징

- Factory Method와 함께 사용
- 내재적 상태와 외재적 상태의 명확한 분리
- 객체 풀(Object Pool) 관리를 통한 메모리 최적화
- 대표적인 예시: 텍스트 에디터의 문자 객체

## 현대적 구현 예시

### JavaScript 기본 구현

```javascript
const books = new Map();

const createBook = (title, author, isbn) => {
  const existingBook = books.has(isbn);

  if (existingBook) {
    return books.get(isbn);
  }

  const book = new Book(title, author, isbn);
  books.set(isbn, book);

  return book;
};

// 사용 예시
const book1 = createBook(
  "JavaScript Patterns",
  "Addy Osmani",
  "978-1449399115"
);
const book2 = createBook(
  "JavaScript Patterns",
  "Addy Osmani",
  "978-1449399115"
);
// book1과 book2는 동일한 인스턴스를 참조
```

## React/Next.js에서

### 1. 컴포넌트 메모이제이션

React의 `React.memo`, `useMemo`, `useCallback`을 활용한 플라이웨이트 패턴 구현:

```javascript
// 공통 스타일을 공유하는 버튼 컴포넌트
const ButtonFlyweight = React.memo(({ variant, size, children, onClick }) => {
  // variant와 size는 내재적 상태 (공유됨)
  const baseStyles = useMemo(
    () => getButtonStyles(variant, size),
    [variant, size]
  );

  // onClick, children은 외재적 상태 (개별적)
  return (
    <button style={baseStyles} onClick={onClick}>
      {children}
    </button>
  );
});
```

### 2. 컴포넌트 팩토리 패턴

```javascript
const componentRegistry = new Map();

const createComponent = (type, props) => {
  const key = `${type}-${JSON.stringify(props.intrinsic)}`;

  if (componentRegistry.has(key)) {
    return componentRegistry.get(key);
  }

  const component = ComponentFactory.create(type, props.intrinsic);
  componentRegistry.set(key, component);
  return component;
};
```

### 3. Next.js에서의 최적화

```javascript
// 이미지 컴포넌트의 플라이웨이트 적용
const ImageFlyweight = ({ src, alt, className }) => {
  const optimizedSrc = useMemo(() => optimizeImageUrl(src), [src]);

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      className={className}
      // Next.js의 자동 최적화와 함께 사용
    />
  );
};
```

## 장단점

### 장점

- 메모리 효율성: 공통 데이터 공유로 메모리 사용량 대폭 감소
- 성능 향상: 객체 생성 비용 절약
- 확장성: 대량의 객체를 효율적으로 관리

### 단점

- 복잡성 증가: 코드 구조가 복잡해질 수 있음
- CPU 오버헤드: 외재적 상태 계산으로 인한 처리 비용
- 현대 JavaScript의 제한적 효용: 프로토타입 상속으로 인해 효과 감소

## 적용 시기

### 사용 권장 상황

- 대량의 유사한 객체 생성이 필요한 경우
- 메모리 사용량이 제한적인 환경
- 객체들 간에 중복 상태가 많은 경우

### 현대 프론트엔드에서의 활용

- 가상 스크롤링 컴포넌트
- 차트 라이브러리의 데이터 포인트
- 게임 엔진의 파티클 시스템
- 대용량 테이블의 셀 렌더링

- [patterns-dev-kr.github.io - Flyweight Pattern](https://patterns-dev-kr.github.io/design-patterns/flyweight-pattern/)
- [Refactoring Guru - Flyweight Pattern](https://refactoring.guru/design-patterns/flyweight)
- Gang of Four Design Patterns (1994)

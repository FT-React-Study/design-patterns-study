# Flyweight 패턴이란?

 플라이웨이트 패턴은 GoF 에 나온 구조 패턴 중 하나이며, 각 객체가 모든 데이터를 각자 유지하는 대신 공통된 부분을 공유하는 디자인 패턴입니다. 클래스를 설계 할 때, 공유되는 부분들은 하나의 객체로 두고, 구체화된 클래스들이 이를 공유해 사용합니다. 이때 공유상태를 저장하는 객체를 플라이웨이트라고 합니다. 플라이웨이트 패턴은 플라이웨이트 객체 풀을 관리하고, 그 플라이웨이트 객체들을 접근해 사용하는 객체들이 존재하는 구조입니다.

# 왜 사용하나요?

 플라이웨이트 패턴은 특정 상황에서 수많은 객체가 공유 상태를 지니고 있을 때 사용하여 중복 데이터를 제거하고 메모리를 절약하기 위해 사용합니다. 

# 플라이웨이트 객체 특징

1. 플라이웨이트 객체들 관리하는 컨테이너 객체가 존재해야합니다.
2. 플라이웨이트 객체는 불변해야합니다.
3. 플라이웨이트 객체들에 편리하게 액세스 하기 위해 기존 플라이웨이트 객체들의 풀을 관리하는 팩토리 메서드를 생성할 수 있습니다. 이 팩토리 메서드는 이미 존재하는 플라이웨이트 객체라면 반환, 아니면 새로 생성해 반환하고 풀에 추가합니다.

# 활용

```tsx
// === 1) 내부 상태: 플라이웨이트가 공유할 폰트 스타일 ===
export type FontStyle = Readonly<{
  family: string;
  size: number;             // px
  weight: "normal" | "bold";
  italic: boolean;
  color: string;            // e.g. "#333"
}>;

export interface GlyphStyleFlyweight {
  getStyle(): FontStyle;    // 내부 상태 읽기 전용
}

// 불변(immutable) 구현체
class ConcreteGlyphStyleFlyweight implements GlyphStyleFlyweight {
  constructor(private readonly style: FontStyle) {}
  getStyle(): FontStyle {
    return this.style;
  }
}

// === 2) 플라이웨이트 팩토리: 스타일 Key 기반 캐시 ===
export class GlyphStyleFactory {
  private cache = new Map<string, GlyphStyleFlyweight>();

  private static makeKey(s: FontStyle): string {
    // 정규화: 대소문자/불리언/순서를 고정
    return [
      s.family.toLowerCase(),
      s.size,
      s.weight,
      s.italic ? 1 : 0,
      s.color.toLowerCase(),
    ].join("|");
  }

  get(style: FontStyle): GlyphStyleFlyweight {
    const key = GlyphStyleFactory.makeKey(style);
    let fw = this.cache.get(key);
    if (!fw) {
      fw = new ConcreteGlyphStyleFlyweight(style);
      this.cache.set(key, fw);
    }
    return fw;
  }

  cacheSize(): number {
    return this.cache.size;
  }
}

// === 3) 각 문자 객체: 외부 상태 + 플라이웨이트 참조 ===
export type Point = Readonly<{ x: number; y: number }>;

export class Character {
  // 외부 상태: 글자 값/좌표(인스턴스마다 다름)
  constructor(
    public readonly char: string,
    public readonly position: Point,
    // 내부 상태는 공유 객체에 위임
    public readonly styleRef: GlyphStyleFlyweight
  ) {}

  // 필요 시 메타 정보만 반환(실제 렌더링/측정 로직은 별도 계층)
  describe(): string {
    const s = this.styleRef.getStyle();
    return `Char('${this.char}')@(${this.position.x},${this.position.y}) ` +
           `[${s.italic ? "italic " : ""}${s.weight} ${s.size}px ${s.family} ${s.color}]`;
  }
}

// === 사용 예 (설계 확인용) ===
const factory = new GlyphStyleFactory();

const normal = factory.get({
  family: "Inter",
  size: 16,
  weight: "normal",
  italic: false,
  color: "#333",
});

const bold = factory.get({
  family: "Inter",
  size: 16,
  weight: "bold",
  italic: false,
  color: "#222",
});

// 서로 다른 문자 인스턴스가 동일한 스타일 플라이웨이트를 공유
const a = new Character("A", { x: 10, y: 20 }, normal);
const b = new Character("B", { x: 19, y: 20 }, normal);
const excl = new Character("!", { x: 28, y: 20 }, bold);

// 설계 점검
console.log(factory.cacheSize()); // 2
console.log(a.describe());
console.log(b.describe());
console.log(excl.describe());
```

# 요즘은 잘 안 쓰는 이유

## 메모리 대신 CPU 를 쓰는 것

 플라이웨이트 메서드를 호출 할 때마다 컨텍스트 데이터 (플라이웨이트 객체 부분 말고 다른 부분)의 일부를 다시 계산해야한다면, 이는 성능상 문제가 있을 수 있습니다. 

## 코드의 가독성이 떨어짐

 코드 자체가 복잡해 바로 알아보기 어렵습니다.

## 언어/런타임 엔진 자체가 최적화되어있음

 이미 내부적으로 이러한 설계가 필요한 클래스들은 최적화가 되어있습니다. Java 의 String 은 내부적으로 플라이웨이트 비슷하게 동작합니다. (문자열 상수 풀, 이미 있는 문자열이라면 그대로 사용)

---

[플라이웨이트 패턴](https://refactoring.guru/ko/design-patterns/flyweight)

[Flyweight 패턴](https://patterns-dev-kr.github.io/design-patterns/flyweight-pattern/)
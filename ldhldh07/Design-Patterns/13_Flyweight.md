# Flywieght

Flyweight 패턴은 객체를 저장할때 공유 가능한 상태를 분리해서 메모리를 절약하는 패턴이다.

같은 속성을 가진 경우 인스턴스를 재사용한다.



## 개념

### Instrinsic State

> 여러 객체가 공유하는 값

### Extrinsic State

> 객체마다 달라지는 값



### 예시

```ts
class IconFlyweight {
  constructor(
    public type: string,
    public url: string,
    public size: { w: number; h: number }
  ) {}
}

```

- IconFlyweight는 아이콘의 공유 가능한 속성만 가진 클래스다.
- 실제 아이콘의 모양, 크기 같은 값은 모든 마커가 똑같이 사용할 수 있으므로 재사용된다.

```ts
class IconRegistry {
  private cache = new Map<string, IconFlyweight>();

  get(type: "cafe" | "bus" | "parking") {
    if (this.cache.has(type)) return this.cache.get(type)!;

    const spec: Record<string, { url: string; size: { w: number; h: number } }> = {
      cafe: { url: "/icons/cafe.png", size: { w: 24, h: 24 } },
      bus: { url: "/icons/bus.png", size: { w: 28, h: 28 } },
      parking: { url: "/icons/parking.png", size: { w: 24, h: 24 } },
    };

    const meta = spec[type];
    const icon = new IconFlyweight(type, meta.url, meta.size);
    this.cache.set(type, icon);
    return icon;
  }

  size() {
    return this.cache.size;
  }
}
```

- IconRegistry는 아이콘을 저장하는 캐시 역할을 한다.
- 요청된 타입이 이미 있으면 기존 인스턴스를 반환하고, 없으면 새로 만들어 캐시에 저장한다.
- 결과적으로 같은 타입(cafe, bus, parking)은 한 번만 생성된다.

```ts
// Extrinsic State
type MarkerExtrinsic = {
  lat: number;
  lng: number;
  angle?: number;
  label?: string;
  visible?: boolean;
};


type Marker = MarkerExtrinsic & {
  id: string;
  icon: IconFlyweight;
};

```

- 마커의 위치, 라벨 같은 값은 개별적이다.

```ts

class MapController {
  private markers: Marker[] = [];
  private icons = new IconRegistry();

  addMarker(type: "cafe" | "bus" | "parking", extrinsic: MarkerExtrinsic) {
    const icon = this.icons.get(type); // 공유 아이콘 재사용
    const marker: Marker = {
      id: crypto.randomUUID(),
      icon,
      ...extrinsic,
    };
    this.markers.push(marker);
    return marker;
  }

  getMarkers() {
    return this.markers;
  }

  getIconCacheSize() {
    return this.icons.size();
  }
}
```

- addMarker에서는 캐시에 있는 아이콘을 가져오고, 위치 등 extrinsic 값만 합쳐서 새로운 마커를 만든다.
- 이렇게 하면 마커 수천 개를 찍어도 아이콘 객체는 타입별로 몇 개만 존재한다.

```ts
const map = new MapController();

map.addMarker("cafe", { lat: 37.5665, lng: 126.9780, label: "커피A" });
map.addMarker("cafe", { lat: 37.5651, lng: 126.9895, label: "커피B" });
map.addMarker("bus", { lat: 37.5700, lng: 126.9768, angle: 45 });
map.addMarker("bus", { lat: 37.5712, lng: 126.9823 });
map.addMarker("parking", { lat: 37.5688, lng: 126.9815, visible: true });

console.log("마커 개수:", map.getMarkers().length);      // 5
console.log("아이콘 캐시 개수:", map.getIconCacheSize()); // 3
```



###  프로토타입 상속으로 비슷한 효과를 낸다

자바스크립트의 객체는 **프로토타입 체인**을 통해 상속을 구현한다.

객체가 특정 속성이나 메서드를 직접 가지고 있지 않으면, 자바스크립트 엔진은 그 객체의 프로토타입을 따라 올라가면서 해당 속성을 찾는다.



이 구조 때문에 공통으로 필요한 메서드나 불변 데이터를 **상위 프로토타입**에 올려두면, 여러 인스턴스가 이를 공유할 수 있다.



- 상위 프로토타입 → 공유 가능한 속성이나 메서드를 보관 (Intrinsic State에 해당)
- 하위 객체(인스턴스) → 각자 고유한 속성을 가짐 (Extrinsic State에 해당)



```ts
function Tree(type, texture) {
  this.type = type;       // 고유 상태 (extrinsic)
  this.texture = texture; // 고유 상태 (extrinsic)
}

// 공통 메서드 (intrinsic)는 프로토타입에 정의
Tree.prototype.render = function (x, y) {
  console.log(`${this.type} tree rendered with texture ${this.texture} at (${x}, ${y})`);
};

const oak1 = new Tree("oak", "oak-texture.png");
const oak2 = new Tree("oak", "oak-texture.png");

console.log(oak1.render === oak2.render); // true → 같은 함수 객체 공유
```

여기서 render 메서드는 모든 인스턴스가 상위 프로토타입에서 공유한다.

각 인스턴스(oak1, oak2)는 위치나 texture 같은 개별 값만 가진다.



- 상위 프로토타입 → 공유 속성/메서드(공통 로직, intrinsic state) 보관
- 하위 인스턴스 → 고유 속성(extrinsic state) 보관



이런 구조 덕분에 Flyweight 패턴이 의도하는 “공유할 수 있는 값은 한 번만 두고, 개별 값만 각자 관리한다”와 유사한 효과를 자연스럽게 얻을 수 있다.
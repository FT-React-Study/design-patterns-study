# Proxy 패턴

## 개요

 프록시 패턴은 어떤 실제 사용하려는 객체에 **접근하기 전에**, 우선적으로 해당 객체에 대한 *기능을 보완*하는 디자인 패턴입니다. 자바스크립트에서는 특히 `Proxy` 객체와 `Reflect` 객체를 통해 언어적으로 객체에 대한 기본 작업을 가로채는 것을 지원하기 때문에 Proxy 패턴을 구현하기 용이합니다.

## 왜 사용하나요?

 객체에 대한 기능 책임은 분리하면서, 부가적인 기능들을 분리해 중간에 끼워넣는 것이 용이한 패턴이 프록시 패턴 입니다. 프록시 패턴으로 어떤 기능을 가진 객체를 감싸서 기능을 추가할 때에는 일반적으로 객체에 대한 기능을 추가 보완한다기 보다는 *보안이나 성능 최적화, 로깅 등의 부가적인 보완 기능*을 끼워넣을 때 사용합니다.

## 활용

### 예시. API 클라이언트 인증 삽입

```tsx
class HRService {
  getEmployeeList() {
    return fetch('/api/employees');
  }
}

class HRServiceProxy {
  private realService: HRService;
  private token: string;

  constructor(realService: HRService, token: string) {
    this.realService = realService;
    this.token = token;
  }

  async getEmployeeList() {
    console.log("[LOG] 직원 리스트 요청 시작");
    const res = await fetch("/api/employees", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) {
      console.error("[ERROR] 직원 목록 불러오기 실패");
    }
    return res;
  }
}
```

 공교롭게도 이런 API 호출 객체 등은 앞서 본 싱글턴 패턴으로 많이 구현 됩니다. 싱글턴 패턴으로 구현될만한 기능들은 프록시 패턴으로 보완 될 가능성이 높아보이네요.

## 사용시 주의점

### 성능

 Proxy 패턴 특성상 정말 자주 일어나는 간단한 동작들(객체에 접근, 새 프로퍼티 추가 등)에 관련 Proxy 함수들이 호출 될 수 있기 때문에 과한 로직이 Proxy 기능으로 있다면 성능에 부정적인 영향을 줄 수 있습니다.

## 부가적인 내용

### `Reflect` 객체

 자바스크립트에서 `Reflect` 객체는 글로벌한 빌트인 객체로 `Proxy` 객체와 같이 쓸때 자주 쓰는 유틸 메서드를 담아놓은 객체입니다. 사용은 `Math` 객체 처럼 `Reflect.set` 과 같이 바로 사용하기도 합니다.
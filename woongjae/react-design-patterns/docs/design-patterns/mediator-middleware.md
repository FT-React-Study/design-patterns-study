# Mediator 패턴

## 개요

 Mediator 패턴(중재자 패턴)은 GoF 책에서도 소개된 행동 디자인 패턴으로, 상호작용이 여러 객체에서 일어날 수 있는 경우 중앙의 중재자가 *여러 상호작용들을 관리*하도록 하는 패턴입니다. 이때, 객체끼리의 직접 통신을 제한하고 중재자 객체를 통해서만 협력하도록 하는 것이 핵심 아이디어 입니다.

## 왜 사용하나요?

![중재자가 없는 경우의 각 상호작용](attachment:98924f36-f43a-4640-94ac-49dd8cf2bcd9:image.png)

중재자가 없는 경우의 각 상호작용

![중재자가 상호작용을 관리후 각 컴포넌트에 전달](attachment:4e4969b6-090c-49f1-af20-06c176a79beb:image.png)

중재자가 상호작용을 관리후 각 컴포넌트에 전달

 중재자 패턴은 여러 객체가 여러 상호작용을 하는 유저 인터페이스 구현에서 많이 사용하며, 각 객체들 끼리의 결합도를 낮추어 각 객체들의 재사용성과 상태 관리의 복잡성을 완화 할 수 있습니다.

## 활용

```tsx
interface Mediator {
  sendMessage(sender: User, message: string): void;
}

class ChatRoom implements Mediator {
  private users: User[] = [];

  register(user: User) {
    this.users.push(user);
  }

  sendMessage(sender: User, message: string) {
    this.users.forEach(user => {
      if (user !== sender) {
        user.receive(message, sender.name);
      }
    });
  }
}

class User {
  constructor(public name: string, private mediator: Mediator) {}

  send(message: string) {
    console.log(`[${this.name}]: ${message}`);
    this.mediator.sendMessage(this, message);
  }

  receive(message: string, from: string) {
    console.log(`[${from} -> ${this.name}]: ${message}`);
  }
}

// 사용
const chatRoom = new ChatRoom();
const alice = new User("Alice", chatRoom);
const bob = new User("Bob", chatRoom);

chatRoom.register(alice);
chatRoom.register(bob);

alice.send("안녕, Bob!");
bob.send("안녕, Alice!");
```

## 단점

### 중재자 객체가 God Object 가 될 수 있습니다.

 신 객체, 전지적 객체 라고도 부르는 이 객체는 단일 책임 원칙에 반대되는 방식으로 하나의 객체가 많은 문제를 책임지고 있습니다. 그러므로, 중재자 객체 자체의 테스트나 디버깅이 힘들어 질 수 있습니다. 그리고, 중재자에서 성능 병목이 생길 수도 있습니다.

---

[중재자 패턴](https://refactoring.guru/ko/design-patterns/mediator)

중재자 패턴 개념 참고

---

# Middleware 패턴(Chain of Responsibility 패턴)

## 개요

 미들웨어 패턴은 디자인 패턴이라고 하기 보단 express.js 의 핵심 개념 중 하나로 보는게 맞는 것 같습니다. express.js 에서는 요청과 응답의 중간에 middleware 라는 중간자 역할을 하는 함수가 여러 동작을 부가적으로 실행합니다. 이 패턴은 GoF 에서 소개된 행위 패턴인 책임 연쇄 패턴에서 왔다 볼 수 있습니다. 그래서 다음과 같이 하나의 요청이 여러 검사 함수들(핸들러)을 거쳐 새로운 객체를 리턴하는 방식으로 구현합니다.

## 왜 사용하나요?

 책임 연쇄 패턴은 하나의 기능이 여러 필터를 통해 응답이 달라져야하는 경우에 사용합니다. 예를 들어 어떤 요청이 서비스에 인증이 되어있고, 권한이 있으며, 데이터가 검증된 상태가 있어야하는 상황이라면, 이 모든 것을 한번에 한 요청에서 검사하는 것이 아닌 인증, 권한 부여, 검증 핸들러가 따로 책임을 나누어 관리하도록 합니다. 이를 통해 책임을 분리하고, 각 책임들을 재사용하기 용이하기 위해 만들어진 패턴 입니다.

 그리고 express.js 에서 이를 middleware 라는 이름을 붙여 책임 연쇄 패턴을 구현한 것이라고 보면 좋을 것 같습니다. (약간의 특화된 변형이 있지만, 큰 동기는 책임 연쇄 패턴에서 파생된 것 같네요.)

## 예시

 아래 첫번째 예시는 아주 간단한 미들웨어 사용 방식으로 `next()` 함수를 통해 다음 미들웨어로 넘어가게 하거나, `next('/route')` 등으로 라우팅을 할 수 있습니다.

```tsx
import express from "express";
const app = express();

// 1️⃣ 모든 요청에 대해 로깅하는 미들웨어
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next(); // 다음 미들웨어로 이동
});

// 2️⃣ 모든 요청에 대해 인증 여부를 확인하는 미들웨어
app.use((req, res, next) => {
  if (req.headers.authorization === "Bearer valid-token") {
    next(); // 인증 성공 → 다음 단계로
  } else {
    res.status(401).send("Unauthorized"); // 인증 실패 → 흐름 종료
  }
});

// 3️⃣ 실제 라우트 핸들러
app.get("/", (req, res) => {
  res.send("Hello, Express Middleware!");
});

// 4️⃣ 서버 실행
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

 아래 예시는 미들웨어 로직을 재사용 가능하게 만들어 적용하는 예시입니다.

```tsx
export function logger(req, res, next) {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next();
}

export function requireAuth(req, res, next) {
  if (req.headers.authorization === "Bearer valid-token") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.headers["x-role"] === role) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
}
```

```tsx
import express from "express";
import { logger } from "../middlewares/logger.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";

const router = express.Router();

// 이 라우트 그룹에 필요한 미들웨어들을 조합
router.use(logger);
router.use(requireAuth);
router.use(requireRole("admin"));

// GET /admin/dashboard
router.get("/dashboard", (req, res) => {
  res.json({ message: "관리자 대시보드" });
});

// GET /admin/users
router.get("/users", (req, res) => {
  res.json({ message: "관리자 사용자 목록" });
});

export default router;
```

```tsx
import express from "express";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(express.json());

// /admin 하위 라우트는 전부 adminRoutes 미들웨어 체인 적용
app.use("/admin", adminRoutes);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

---

[책임 연쇄 패턴](https://refactoring.guru/ko/design-patterns/chain-of-responsibility)

책임 연쇄 패턴 참고 자료
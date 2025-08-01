# Container/Presentational 패턴

## 개요

 Container/Presentational 패턴은 *예전 리액트 생태계에서 자주 사용되었던 패턴 중에 하나*로, 비즈니스 로직을 담은 Container 컴포넌트와 UI 를 표현하는데 집중한 Presentational 컴포넌트로 나누어 관리하는 디자인 패턴입니다. 예전이라는 말에서 알 수 있듯 현재는 이 패턴이 발전하여 커스텀 훅을 만들어 UI 컴포넌트가 이를 사용하는 방식으로 발전했습니다.

## 왜 사용하나요?

 UI 와 비즈니스 로직, 이 둘에 대한 **관심사 분리**를 위해 만들어졌습니다. 프론트엔드에서는 UI 와 비즈니스 로직을 따로 분리해 관리하려는 노력을 많이 합니다. UI 와 비즈니스 로직을 분리해 관리하면 테스트가 쉽고, 재사용성이 증가합니다.

## 활용

 기본적으로 Presentational 컴포넌트는 UI 관련 코드만 작성하고, Container 컴포넌트가 API 를 호출하거나 상태관리 하는 등 비즈니스 로직을 처리하고 Presentational 컴포넌트에서 props 로 전달하는 방식으로 관리 됩니다.

### 예시

```tsx
// UserDetailContainer.tsx
import { useEffect, useState } from "react";
import { UserDetail } from "./UserDetail";
import { fetchUserById } from "@/api/user";

export function UserDetailContainer({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<null | {
    name: string;
    position: string;
    department: string;
    roles: string[];
  }>(null);

  useEffect(() => {
    fetchUserById(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>사용자를 찾을 수 없습니다.</p>;

  return (
    <UserDetail
      name={user.name}
      position={user.position}
      department={user.department}
      roles={user.roles}
    />
  );
}
```

```tsx
// UserDetail.tsx
type Props = {
  name: string;
  position: string;
  department: string;
  roles: string[];
};

export function UserDetail({ name, position, department, roles }: Props) {
  return (
    <div>
      <h2>{name}</h2>
      <p>직책: {position}</p>
      <p>부서: {department}</p>
      <div>
        <strong>권한:</strong>
        <ul>
          {roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## 단점

### 비즈니스 로직 공유 한계

 여러 Container 에 중복적인 비즈니스 로직이 있을 경우 공유하기 쉽지 않습니다.

 사실 엄밀하게 정의해서 그렇지 커스텀 훅을 통해 UI 컴포넌트에게 props 로 데이터를 넘겨주는 컨테이너 함수가 필요한 것은 거의 Container/Presentational 패턴이나 마찬가지 입니다.
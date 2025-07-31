# Container/Presentational

Container/Presentational 패턴은 컴포넌트의 책임을 분리한다

- 비즈니스 로직
- VIew - UI

## 사용하는 이유

두 가지 책임을 분명히 나누면 다음과 같은 이점이 있다:

- 유지보수성 증가: 로직과 UI가 분리되어 변경에 강해짐

- 테스트 용이성: 프리젠테이션 컴포넌트는 순수 함수처럼 테스트 가능

- 재사용성 증가: UI와 로직 각각을 독립적으로 재사용 가능

  

### Container Component

Container 컴포넌트는 주로 다음을 담당한다:

- 상태 관리
- 비즈니스 로직 처리
- API 호출 및 비동기 처리
- 프리젠테이셔널 컴포넌트에 prop으로 데이터 전달

UI에는 관여하지 않는다. 어떤 컴포넌트를 어떻게 렌더링할지는 Presentational 컴포넌트의 몫이다.



### Presentational Component

단순히 props를 받아 UI를 표현하는 역할만 한다.

- 상태 없음 (Stateless)

- 로직 없음
- 전달받은 prop만 사용
- 스타일링 중심
- 보통 테스트가 매우 쉽고, 독립성이 높음

```ts
type Props = {
  items: string[]
  onRefresh: () => void
}

export const DogImageList = ({ items, onRefresh }: Props) => (
  <div>
    <button onClick={onRefresh}>다시 불러오기</button>
    <ul>
      {items.map((src, i) => (
        <li key={i}><img src={src} /></li>
      ))}
    </ul>
  </div>
)
```





## Hook으로 Container 역할을 분리

Container 컴포넌트를 아예 Custom Hook으로 분리하면,

로직과 UI를 하나의 파일 안에서 명확히 분리할 수 있다.

```ts
export default function useDogImages() {
  const [dogs, setDogs] = useState([])

  useEffect(() => {
    fetch('https://dog.ceo/api/breed/labrador/images/random/6')
      .then(res => res.json())
      .then(({ message }) => setDogs(message))
  }, [])

  return dogs
}
```

이렇게 하면 Container 역할은 훅이 맡고, 컴포넌트는 UI만 담당하는 구조가 된다.

```ts
import useDogImages from './useDogImages'

export const DogImageList = () => {
  const { dogs, fetchDogs } = useDogImages()

  return (
    <div>
      <button onClick={fetchDogs}>다시 불러오기</button>
      <ul>
        {dogs.map((src, i) => (
          <li key={i}><img src={src} /></li>
        ))}
      </ul>
    </div>
  )
}
```





### SSR에서의 활용

SSR 환경에서는 useEffect, useState, 브라우저 API 등을 직접 사용할 수 없다.

따라서 `Container/Presentational` 패턴을 적용할 경우 부분적인 클라이언트 렌더링을 구현할 수 있다. 

- 서버에서 데이터를 미리 가져와 Container 역할 수행
- 그 데이터를 props로 Presentational 컴포넌트에 전달

```ts
export default async function DogContainer() {
  const res = await fetch('https://dog.ceo/api/breed/labrador/images/random/6')
  const { message: dogs } = await res.json()

  return <DogImageList items={dogs} />
}
```


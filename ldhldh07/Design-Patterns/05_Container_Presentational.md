# Container/Presentational

**Container/Presentational 패턴**은 컴포넌트의 책임을 분리하여 **비즈니스 로직과 View의 역할을 나누는** 대표적인 설계 방식이다.



- 두 가지 책임을 분명히 나누면 다음과 같은 이점이 있다:

  - **유지보수성 증가**: 로직과 UI가 분리되어 변경에 강해짐

  - **테스트 용이성**: 프리젠테이션 컴포넌트는 순수 함수처럼 테스트 가능

  - **재사용성 증가**: UI와 로직 각각을 독립적으로 재사용 가능

    

### Container Component

Container 컴포넌트는 주로 다음을 담당한다:

- 상태 관리
- 비즈니스 로직 처리
- API 호출 및 비동기 처리
- 프리젠테이셔널 컴포넌트에 prop으로 데이터 전달



UI에는 관여하지 않는다. 어떤 컴포넌트를 어떻게 렌더링할지는 프리젠테이셔널 컴포넌트의 몫이다.



### Presentational Component

프리젠테이셔널 컴포넌트는 데이터를 조작하지 않고 받아서 그대로 화면에 어떻게 띄울지를 담당한다.

- 전달받은 데이터를 UI로 표현
- 상태나 로직은 포함하지 않음
- 외부에서 넘겨준 prop만 사용
- 단순한 구조와 스타일링 중심



## prop

Container Component에서 처리한 데이터는 prop을 통해 전달한다.

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





## hook로 대체

Container 컴포넌트의 로직을 `Custom Hook`으로 분리할 수도 있다.

이 방식은 하나의 컴포넌트 파일 안에서 로직과 UI를 명확히 나눌 수 있게 한다.

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

SSR 환경에서는 브라우저 API나 훅(useEffect, useState, etc.)을 사용할 수 없다.



데이터 fetching, 상태 초기화 등은 서버에서 처리하고

Container 컴포넌트 형태로 서버에서 초기화된 데이터를 처리 후 presentational component로 전달하는 형태가 더 적합하다

```ts
export default async function DogContainer() {
  const res = await fetch('https://dog.ceo/api/breed/labrador/images/random/6')
  const { message: dogs } = await res.json()

  return <DogImageList items={dogs} />
}
```


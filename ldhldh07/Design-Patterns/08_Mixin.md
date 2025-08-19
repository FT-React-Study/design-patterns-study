# Mixin

상속 없이 객체나 클래스에 프로퍼티를 추가할 수 있는 패턴이다.

별도로 정의된 객체의 프로퍼티를 Mixin할 수 있는 패턴이다.

- 그렇기 때문에 해당 객체는 재사용 가능하다.

```ts
class Dog {
  constructor(name) {
    this.name = name
  }
}

const dogFunctionality = {
  bark: () => console.log('Woof!'),
  wagTail: () => console.log('Wagging my tail!'),
  play: () => console.log('Playing!'),
}

Object.assign(Dog.prototype, dogFunctionality)
```

```ts
const pet1 = new Dog('Daisy')

pet1.name // Daisy
pet1.bark() // Woof!
pet1.play() // Playing!
```



새로운 기능을 '평면적'으로 합성하고자 할때 좋은 패턴이다.

## Mixin 상속

```ts
const animalFunctionality = {
  walk: () => console.log('Walking!'),
  sleep: () => console.log('Sleeping!'),
}

const dogFunctionality = {
  bark: () => console.log('Woof!'),
  wagTail: () => console.log('Wagging my tail!'),
  play: () => console.log('Playing!'),
  walk() {
    super.walk()
  },
  sleep() {
    super.sleep()
  },
}

Object.assign(dogFunctionality, animalFunctionality)
Object.assign(Dog.prototype, dogFunctionality)
```



Mixin은 상속한 후 사용할 수 있다.



## Mixin의 단점

- 숨은 결합

- 네임 스페이스 충돌

- 복잡도 상승

  

[리액트](https://ko.legacy.reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)와 [뷰](https://vuejs.org/api/options-composition.html#mixins)에서는 공통적으로 mixin을 권장하지 않습니다.



대신 리액트는 HOC, 훅, 유틸함수로 대체할 수 있는 방법들을 제시합니다.

- 선언적 렌더링, 캡슐화되어 쪼갠 컴포넌트, 단방향 데이터 플로우
- 구독 / 사이드 이펙트 -> 커스텀 훅
- 구 버전 context api 래핑 -> 새 버전의 context api
- 순수 계산 함수 -> 유틸 함수로 정의 후 모듈 패턴으로 import

뷰는 vue3에서 제공하는 composable을 이용해서 기능 확장을 재사용하도록 권장합니다.



### 암묵적 의존성

mixin을 통한 기능 결합은 이를 명시하지 않습니다.

컴포넌트에 믹스인을 통해 새로운 기능을 추가한 경우 render()에서 정의되지 않기 때문에 어느 믹스인을 결합했는지 추적하기가 힘듭니다.

믹스인을 중첩적으로 사용했을 경우 그 문제점은 더 심해집니다.

`React`

```js
// RowMixin.js
export const RowMixin = {
  renderHeader() {
    // 컴포넌트가 getHeaderText()를 "갖고 있을 거라" 가정 (숨은 계약)
    return <h1>{this.getHeaderText()}</h1>;
  }
};

// UserRow.jsx (createClass 시절 가정)
const UserRow = React.createClass({
  mixins: [RowMixin],
  getHeaderText() {                 // 이게 없으면 런타임에야 터짐
    return this.props.user.fullName;
  },
  render() {
    return (
      <div>
        {this.renderHeader()}       // 이 메서드가 어디서 왔는지 파일만 보면 안 보임
        <p>{this.props.user.bio}</p>
      </div>
    );
  }
});
```

```ts
// RowHeader.jsx
export function RowHeader({ text }) {
  return <h1>{text}</h1>;
}

// UserRow.jsx
export function UserRow({ user }) {
  return (
    <div>
      <RowHeader text={user.fullName} />  {/* "무엇을 쓰는지"가 코드에 드러남 */}
      <p>{user.bio}</p>
    </div>
  );
}
```

`vue`

```js
// titleMixin.js (Vue 2)
export default {
  methods: {
    renderHeader() {
      // 컴포넌트가 getTitle()을 제공한다고 가정
      return this.$createElement('h1', this.getTitle());
    }
  }
};

// UserCard.vue
export default {
  mixins: [titleMixin],
  methods: {
    getTitle() { return this.user.name; } // 없으면 런타임까지 모름
  },
  render(h) {
    return h('div', [ this.renderHeader(), h('p', this.user.bio) ]);
  }
}
```

```ts
// useTitle.ts (Vue 3)
import { computed } from 'vue';
export function useTitle(user: { name: string }) {
  const title = computed(() => user.name);
  return { title };
}

// UserCard.vue
<script setup lang="ts">
import { useTitle } from '@/composables/useTitle';
const props = defineProps<{ user: { name: string; bio: string } }>();
const { title } = useTitle(props.user);
</script>

<template>
  <div>
    <h1>{{ title }}</h1>   <!-- 어디서 왔는지 import로 명시 -->
    <p>{{ props.user.bio }}</p>
  </div>
</template>
```





### 네임 스페이스 충돌

믹스인은 수평적으로 결합합니다.

그렇기 떄문에 다른 믹스인이 같은 이름의 메서드를 사용하는 경우 네임 스페이스 충돌이 일어나기 쉽습니다.

충돌이 나서 mixin의 메소드를 교체 시도할 경우 그 mixin을 사용중인 다른 장소에서 문제가 발생할 수 있습니다.

React

```ts
// WindowSizeMixin.js
export const WindowSizeMixin = {
  componentDidMount() { window.addEventListener('resize', this.handleChange); },
  componentWillUnmount() { window.removeEventListener('resize', this.handleChange); },
  handleChange() { this.setState({ w: window.innerWidth }); }  // <-- handleChange
};

// FluxListenerMixin.js
export const FluxListenerMixin = {
  componentDidMount() { store.subscribe(this.handleChange); },
  componentWillUnmount() { store.unsubscribe(this.handleChange); },
  handleChange() { this.setState({ data: store.getState() }); } // <-- handleChange (충돌!)
};

// App.jsx
const App = React.createClass({
  mixins: [WindowSizeMixin, FluxListenerMixin], // 같은 이름 충돌, 순서에 따라 덮어씌움
  render() { /* ... */ }
});
```

```ts
// useWindowSize.js
import { useEffect, useState } from 'react';
export function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

// useStore.js
import { useEffect, useState } from 'react';
export function useStore(store) {
  const [data, setData] = useState(store.getState());
  useEffect(() => {
    const unsub = store.subscribe(() => setData(store.getState()));
    return unsub;
  }, [store]);
  return data;
}

// App.jsx
export function App({ store }) {
  const width = useWindowSize();          // 각 훅이 자기 이름을 가짐 → 충돌 없음
  const data  = useStore(store);
  return <pre>{JSON.stringify({ width, data }, null, 2)}</pre>;
}
```

Vue

```ts
// loadingMixin.js
export default {
  data: () => ({ loading: false }),
  methods: { reset() { this.loading = false; } } // <-- reset
};

// formMixin.js
export default {
  data: () => ({ loading: true }),               // <-- loading (충돌)
  methods: { reset() { this.form = {}; } }       // <-- reset (충돌)
};

// Comp.vue
export default {
  mixins: [loadingMixin, formMixin] // 💥 data/메서드 이름이 겹치면 하나가 덮음
};
```

```ts
// useLoading.ts
import { ref } from 'vue';
export function useLoading(initial = false) {
  const loading = ref(initial);
  const setLoading = (v: boolean) => (loading.value = v);
  return { loading, setLoading };
}

// useForm.ts
import { reactive } from 'vue';
export function useForm() {
  const form = reactive<{ [k: string]: any }>({});
  const resetForm = () => { Object.keys(form).forEach(k => delete form[k]); };
  return { form, resetForm };
}

// Comp.vue
<script setup lang="ts">
import { useLoading } from '@/composables/useLoading';
import { useForm } from '@/composables/useForm';

const { loading, setLoading } = useLoading(true);
const { form, resetForm } = useForm();        // 이름이 겹치면 구조분해 시 별칭도 가능
// const { resetForm: resetQuery } = useQuery();  ← 이런 식으로 명시적으로 분리
</script>
```


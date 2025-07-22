# Provider

데이터를 여러 컴포넌트들이 접근하는 방식으로 props를 통한 방식이 있다.

이 방식은 그 깊이가 깊어질 수록 수정의 가능성이 적어지고 데이터의 원천도 찾기 힘들다.

이 때 사용하는 것이 Provider 패턴이다

상위 컴포넌트를 Wrapper 형식으로 감싸서 상태과 기능을 제공해주는 패턴입니다.

- 의존성 주입
- 전역 접근 가능한 추상화 로직





### React의 Context

대표적인 Provider 패턴이며 `.createContext()`

```ts
interface BottomSheetOptions
  extends Omit<BottomSheetProps, 'open' | 'onOpenChange' | 'children'> {}

interface BottomSheetConfigs {
  content: ReactNode;
  options?: BottomSheetOptions;
}

interface BottomSheetContext {
  isOpen: boolean;
  open: (configs: BottomSheetConfigs) => void;
  close: () => void;
  closeAsync: () => Promise<void>;
}

const context = createContext<BottomSheetContext>({
  isOpen: false,
  open: () => {},
  close: () => {},
  closeAsync: async () => {},
});

const Provider = ({ children: providerChildren }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<ReactNode>(null);
  const bottomSheetOptionsRef = useRef<BottomSheetOptions>({});

  const open = useCallback(({ content, options }: BottomSheetConfigs) => {
    contentRef.current = content;
    bottomSheetOptionsRef.current = options || {};
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(isOpen);
  }, [isOpen]);

  const closePromiseRef = useRef<{
    resolve: (value: void | PromiseLike<void>) => void;
  } | null>(null);

  useEffect(() => {
    if (!mounted && closePromiseRef.current) {
      closePromiseRef.current.resolve();
      closePromiseRef.current = null;
    }
  }, [mounted]);

  const closeAsync = useCallback(() => {
    return new Promise<void>((resolve) => {
      closePromiseRef.current = { resolve };
      setIsOpen(false);
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({ isOpen, open, close, closeAsync }),
    [isOpen, open, close, closeAsync],
  );

  return (
    <context.Provider value={memoizedValue}>
      {providerChildren}
      {mounted && (
        <BottomSheet
          open={isOpen}
          {...bottomSheetOptionsRef.current}
          onOpenChange={setIsOpen}
        >
          {contentRef.current}
        </BottomSheet>
      )}
    </context.Provider>
  );
};

const useBottomSheet = () => {
  return useContext(context);
};

BottomSheet.Provider = Provider;
BottomSheet.useBottomSheet = useBottomSheet;

```



#### value Prop

Provider 의 value={data} 프로퍼티를 통해 데이터를 하위 컴포넌트에 전파할 수 있다

해당 Wrapper에 감싸져 있는 컴포넌트에서 



#### useContext()

하위 컴포넌트에서 prop된 data를 호출할 수 있는 hook이다

그 뿐 아니라 직접 custom한 훅을 만들어서 반환하도록 할 수 있다.



#### 주의할점

이 컨텍스트를 참조하는 모든 컴포넌트의 데이터 변경시 모두 리렌더링된다

##### 해결법

해당 데이터를 분리해서 해당 컴포넌트에 격리한 후 리렌더링해야할 타이밍에 리렌더링하도록 한다.
export function withLoader<P extends object>(Wrapped: React.ComponentType<P>) {
  const withLoaderHOC: React.FC<P> = (props) => {
    console.log("Loading...");
    console.log(props);
    return <Wrapped {...props} loaded={true} />;
  };
  return withLoaderHOC;
}

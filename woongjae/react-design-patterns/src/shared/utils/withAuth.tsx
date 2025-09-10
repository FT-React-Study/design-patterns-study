export function withAuth<P extends object>(Wrapped: React.ComponentType<P>) {
  const withAuthHOC: React.FC<P> = (props) => {
    console.log("authenticated!");
    console.log(props);
    return <Wrapped {...props} />;
  };
  return withAuthHOC;
}

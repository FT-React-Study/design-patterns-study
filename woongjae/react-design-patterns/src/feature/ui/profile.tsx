import { withAuth, withLoader } from "../../shared";

type ProfileProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

function Profile({ user }: ProfileProps) {
  return (
    <div>
      <h2>Profile</h2>
      <p>This is the profile component.</p>
      <p>User ID: {user.id}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

export const AuthenticatedProfile = withLoader(withAuth(Profile));
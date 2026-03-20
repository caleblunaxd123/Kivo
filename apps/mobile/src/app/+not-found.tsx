import { Redirect } from 'expo-router';

// Catch-all for unmatched routes → send to root index
export default function NotFound() {
  return <Redirect href="/" />;
}

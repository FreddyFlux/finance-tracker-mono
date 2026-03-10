import { Redirect, Slot } from 'expo-router';
import { useAuth } from '@clerk/expo';

export default function AuthedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}

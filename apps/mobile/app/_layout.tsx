import { ClerkProvider, ClerkLoaded } from '@clerk/expo'
import * as SecureStore from 'expo-secure-store'
import { Slot } from 'expo-router'
import '../global.css'

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key)
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value)
  },
}

export default function RootLayout() {
  return (
    
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  )
}
import { ClerkProvider, ClerkLoaded } from '@clerk/expo'
import * as SecureStore from 'expo-secure-store'
import { Slot } from 'expo-router'
import { PortalHost } from '@rn-primitives/portal'
import { LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../global.css'

// Suppress SafeAreaView deprecation warning from React Native / dependencies.
// Our app uses react-native-safe-area-context; the warning comes from RN core.
LogBox.ignoreLogs(['SafeAreaView has been deprecated'])

const queryClient = new QueryClient()

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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ClerkProvider
            tokenCache={tokenCache}
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          >
            <ClerkLoaded>
              <Slot />
              <PortalHost />
            </ClerkLoaded>
          </ClerkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}
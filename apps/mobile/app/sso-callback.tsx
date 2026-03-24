import { ActivityIndicator, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@money-saver/validations'

/**
 * OAuth callback route used by Clerk's startSSOFlow (Google sign-in).
 * The redirect URL is exp://.../--/sso-callback (Expo Go) or money-saver://sso-callback (dev build).
 * This route exists so Expo Router can match the URL and avoid "Unmatched Route".
 * It shows only a loading state - no redirect. The GoogleSignInButton's handlePress
 * completes the flow and navigates to dashboard via router.replace.
 */
export default function SSOCallback() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-violet-800">
      <ActivityIndicator size="large" color={colors.amber[400]} />
      <Text className="mt-4 font-body text-base text-violet-200">Signing in...</Text>
    </SafeAreaView>
  )
}

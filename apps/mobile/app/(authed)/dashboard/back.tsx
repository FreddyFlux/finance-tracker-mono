import { Redirect } from 'expo-router'

/**
 * Placeholder screen for the Back tab button.
 * The tab bar button overrides navigation to call router.back() instead.
 * This screen is never shown in normal use.
 */
export default function BackTabScreen() {
  return <Redirect href="/(authed)/dashboard" />
}

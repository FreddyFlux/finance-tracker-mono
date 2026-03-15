import { Redirect } from 'expo-router'

/**
 * Placeholder screen for the User tab button.
 * The tab bar button shows the avatar popover instead of navigating.
 * This screen is never shown in normal use.
 */
export default function UserTabScreen() {
  return <Redirect href="/(authed)/dashboard" />
}

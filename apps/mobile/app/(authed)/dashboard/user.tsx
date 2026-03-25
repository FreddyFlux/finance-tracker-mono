import { Redirect } from 'expo-router'

/** User tab triggers the account menu from the tab bar; this route is not shown in normal use. */
export default function UserTabScreen() {
  return <Redirect href="/(authed)/dashboard" />
}

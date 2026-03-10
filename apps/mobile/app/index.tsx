import { useAuth } from '@clerk/expo'
import { Link, Redirect } from 'expo-router'
import { ChartColumnBigIcon } from 'lucide-react-native'
import { Pressable, View, Text } from 'react-native'

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href="/(authed)/dashboard" />
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ChartColumnBigIcon size={48} className="text-lime-500 mb-4" />
      <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
        Money Saver
      </Text>
      <Text className="mb-8 text-center text-base text-gray-600">
        Overview of your finance and spending
      </Text>
      <View className="w-full max-w-xs gap-3">
        <Link href="/sign-in" asChild>
          <Pressable className="rounded-lg bg-lime-600 px-6 py-3 active:opacity-80">
            <Text className="text-center font-semibold text-white">Sign in</Text>
          </Pressable>
        </Link>
        <Link href="/sign-up" asChild>
          <Pressable className="rounded-lg border border-lime-600 px-6 py-3 active:opacity-80">
            <Text className="text-center font-semibold text-lime-600">
              Sign up
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

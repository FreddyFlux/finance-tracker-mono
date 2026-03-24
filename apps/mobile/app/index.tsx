import { useAuth } from '@clerk/expo'
import { Link, Redirect } from 'expo-router'
import { ChartColumnBigIcon } from 'lucide-react-native'
import { Pressable, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@money-saver/validations'

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href="/(authed)/dashboard" />
  }

  return (
    <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4">
          <ChartColumnBigIcon size={48} color={colors.amber[400]} />
        </View>
        <Text className="mb-1 text-center font-display-medium text-2xl text-white">
          Money Saver
        </Text>
        <Text className="mb-8 text-center font-body text-base italic text-violet-200">
          Overview of your finance and spending
        </Text>
        <View className="w-full max-w-xs gap-3">
          <Link href="/sign-in" asChild>
            <Pressable className="rounded-pill bg-amber-500 px-6 py-3 active:opacity-90">
              <Text className="text-center font-body-medium text-base text-violet-900">
                Sign in
              </Text>
            </Pressable>
          </Link>
          <Link href="/sign-up" asChild>
            <Pressable className="rounded-pill border border-white/30 bg-transparent px-6 py-3 active:opacity-80">
              <Text className="text-center font-body-medium text-base text-white">
                Sign up
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

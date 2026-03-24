import { Link } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@money-saver/validations'

export default function Connections() {
  return (
    <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
      <View className="border-b border-violet-700/50 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Link href="/(authed)/dashboard" asChild>
            <Pressable
              className="flex-row items-center gap-1 rounded-md py-1 active:opacity-80"
              hitSlop={8}
            >
              <ChevronLeft size={22} color={colors.amber[400]} />
              <Text className="font-body-medium text-amber-400">Back</Text>
            </Pressable>
          </Link>
        </View>
        <Text className="mt-3 font-display-medium text-2xl text-white">Connections</Text>
        <Text className="mt-1 font-body text-sm text-violet-200">
          Link accounts and shared access will appear here.
        </Text>
      </View>
    </SafeAreaView>
  )
}

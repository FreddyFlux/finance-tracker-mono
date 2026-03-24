import { useClerk, useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { LogOut } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@money-saver/validations'
import { Avatar } from './ui/Avatar'
import { Popover } from './ui/Popover'

export function UserMenuButton() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/')
  }

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ?? '?'

  return (
    <Popover
      trigger={
        <Avatar
          source={user?.imageUrl ?? null}
          fallback={
            <Text className="font-body-medium text-xs text-violet-700">{initials}</Text>
          }
          size={32}
        />
      }
    >
      <View className="gap-1">
        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center gap-2 rounded-md px-3 py-2 active:bg-violet-50"
        >
          <LogOut size={18} color={colors.gray[600]} />
          <Text className="font-body-medium text-gray-900">Sign out</Text>
        </Pressable>
      </View>
    </Popover>
  )
}

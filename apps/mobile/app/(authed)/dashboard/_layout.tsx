import { colors } from '@money-saver/validations'
import { Tabs, useRouter } from 'expo-router'
import { ArrowLeft, Home } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { UserMenuButton } from '../../../components/UserMenuButton'

const SHELL = colors.violet[900]
const SHELL_BORDER = colors.violet[800]
const NAV_INACTIVE = colors.violet[300]
const NAV_ACTIVE = '#FFFFFF'

export default function DashboardLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SHELL,
          borderTopColor: SHELL_BORDER,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: NAV_ACTIVE,
        tabBarInactiveTintColor: NAV_INACTIVE,
      }}
    >
      <Tabs.Screen
        name="back"
        options={{
          title: 'Back',
          tabBarButton: (props) => (
            <Pressable
              onPress={() => router.back()}
              style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, props.style]}
            >
              <ArrowLeft size={24} color={NAV_INACTIVE} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{
          title: 'Transactions',
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="connections/index"
        options={{
          title: 'Connections',
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Account',
          tabBarButton: (props) => (
            <Pressable
              style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, props.style]}
            >
              <UserMenuButton />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  )
}

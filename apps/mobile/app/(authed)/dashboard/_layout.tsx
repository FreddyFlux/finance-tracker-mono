import { useRouter } from 'expo-router'
import { ArrowLeft, Home } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Tabs } from 'expo-router'
import { UserMenuButton } from '../../../components/UserMenuButton'

export default function DashboardLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
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
              <ArrowLeft size={24} className="text-gray-700" />
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

import { useAuth } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { useConnectionsForFilter } from '@money-saver/api-client'
import { generateUserCombinations } from '@money-saver/validations'
import { ChevronDown } from 'lucide-react-native'
import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuOverlay,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from './ui/DropdownMenu'

interface UserFilterProps {
  value?: string[]
  onChange: (userIds: string[] | undefined) => void
}

export function UserFilter({ value, onChange }: UserFilterProps) {
  const { userId: currentUserId, getToken } = useAuth()
  const { data: token } = useQuery({
    queryKey: ['clerk-token'],
    queryFn: () => getToken(),
  })
  const { data: connectionsData, isLoading, error: connectionsError } =
    useConnectionsForFilter(token ?? null)

  const combinations = useMemo(() => {
    if (!connectionsData || !currentUserId) return []

    const connectedUserIds = connectionsData.connections.map(
      (conn) => conn.otherUserId,
    )
    const emailMap = new Map<string, string>()
    emailMap.set(
      currentUserId,
      connectionsData.currentUserEmail || currentUserId,
    )
    connectionsData.connections.forEach((conn) => {
      emailMap.set(conn.otherUserId, conn.otherUserEmail)
    })

    const combos = generateUserCombinations(currentUserId, connectedUserIds)

    return combos.map((combo) => {
      let label: string
      if (combo.userIds.length === 1 && combo.userIds[0] === currentUserId) {
        label = 'My Transactions'
      } else if (combo.userIds.includes(currentUserId)) {
        const otherEmails = combo.userIds
          .filter((id) => id !== currentUserId)
          .map((id) => emailMap.get(id) || id)
        label = `My Transactions + ${otherEmails.join(' + ')}`
      } else {
        const emails = combo.userIds.map((id) => emailMap.get(id) || id)
        label = emails.join(' + ')
      }

      return {
        ...combo,
        label,
      }
    })
  }, [connectionsData, currentUserId])

  const selectedLabel = useMemo(() => {
    if (!value || value.length === 0) {
      return currentUserId ? 'My Transactions' : 'Select...'
    }
    const combo = combinations.find(
      (c) =>
        JSON.stringify([...c.userIds].sort()) ===
        JSON.stringify([...value].sort()),
    )
    return combo?.label ?? 'My Transactions'
  }, [value, combinations, currentUserId])

  const handleChange = (userIds: string[]) => {
    onChange(userIds.length > 0 ? userIds : undefined)
  }

  if (isLoading) {
    return (
      <Text className="text-sm text-gray-500">Loading user filter...</Text>
    )
  }

  if (connectionsError) {
    return (
      <View className="flex-1">
        <Text className="mb-2 text-sm font-medium text-gray-600">
          Filter by User
        </Text>
        <Text className="text-sm text-red-500">
          Failed to load filter: {connectionsError.message}
        </Text>
      </View>
    )
  }

  if (combinations.length === 0) {
    return null
  }

  return (
    <View className="flex-1">
      <Text className="mb-2 text-sm font-medium text-gray-600">
        Filter by User
      </Text>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Pressable className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 active:opacity-80">
            <Text
              className="flex-1 text-gray-800"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedLabel}
            </Text>
            <ChevronDown size={18} className="text-gray-500" />
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuOverlay style={StyleSheet.absoluteFill} closeOnPress />
          <DropdownMenuContent className="min-w-[200px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            {combinations.map((combo, index) => {
              const comboValue = JSON.stringify([...combo.userIds].sort())
              const isSelected =
                value &&
                value.length > 0 &&
                JSON.stringify([...value].sort()) === comboValue

              return (
                <DropdownMenuItem
                  key={index}
                  onPress={() => handleChange(combo.userIds)}
                  closeOnPress
                >
                  <Text
                    className={isSelected ? 'font-semibold text-gray-900' : 'text-gray-800'}
                  >
                    {combo.label}
                  </Text>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </View>
  )
}

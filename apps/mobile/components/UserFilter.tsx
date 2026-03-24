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
      <Text className="font-body text-sm text-violet-300">Loading user filter...</Text>
    )
  }

  if (connectionsError) {
    return (
      <View className="w-full">
        <Text className="mb-2 font-body-medium text-2xs uppercase tracking-wide text-violet-300">
          Filter by user
        </Text>
        <Text className="font-body text-sm text-danger">
          Failed to load filter: {connectionsError.message}
        </Text>
      </View>
    )
  }

  if (combinations.length === 0) {
    return null
  }

  return (
    <View className="w-full">
      <Text className="mb-2 font-body-medium text-2xs uppercase tracking-wide text-violet-300">
        Filter by user
      </Text>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Pressable className="flex-row items-center justify-between rounded-md border border-violet-600 bg-violet-800 px-4 py-3 active:opacity-90">
            <Text
              className="flex-1 font-body text-white"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedLabel}
            </Text>
            <ChevronDown size={18} color="#B89FD8" />
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuOverlay style={StyleSheet.absoluteFill} closeOnPress />
          <DropdownMenuContent
            className="min-w-[200px] rounded-lg border border-violet-700 bg-violet-900 p-1 shadow-md"
            sideOffset={8}
          >
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
                    className={
                      isSelected ? 'font-body-medium text-white' : 'font-body text-violet-200'
                    }
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

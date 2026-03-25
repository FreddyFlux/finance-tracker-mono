import {
  useTransactionsByMonth,
  type Transaction,
} from '@money-saver/api-client'
import { useAuth } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { addMonths, format, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useMemo } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TransactionRow } from '../../../../components/TransactionRow'
import { colors } from '@money-saver/validations'

export default function TransactionsScreen() {
  const router = useRouter()
  const { getToken, userId } = useAuth()
  const { data: token } = useQuery({
    queryKey: ['clerk-token'],
    queryFn: () => getToken(),
  })

  const params = useLocalSearchParams<{
    month?: string
    year?: string
    userIds?: string
  }>()

  const month = useMemo(() => {
    const m = Number(params.month)
    const n = new Date()
    return m >= 1 && m <= 12 ? m : n.getMonth() + 1
  }, [params.month])

  const year = useMemo(() => {
    const y = Number(params.year)
    const n = new Date()
    return Number.isFinite(y) && y > 1900 ? y : n.getFullYear()
  }, [params.year])

  const userIds = useMemo(
    () => params.userIds?.split(',').filter(Boolean),
    [params.userIds],
  )

  const { data: transactions, isLoading, error } = useTransactionsByMonth(
    year,
    month,
    token ?? null,
    userIds,
  )

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy')

  const goMonth = (delta: number) => {
    const d = addMonths(new Date(year, month - 1, 1), delta)
    router.setParams({
      month: String(d.getMonth() + 1),
      year: String(d.getFullYear()),
      ...(userIds?.length ? { userIds: userIds.join(',') } : {}),
    })
  }

  const openTransaction = (t: Transaction) => {
    if (!userId || t.userId !== userId) return
    router.push(`/(authed)/dashboard/transactions/${t.id}`)
  }

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
        <Text className="mt-3 font-display-medium text-2xl text-white">Transactions</Text>

        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => goMonth(-1)}
            className="rounded-md p-2 active:opacity-80"
            hitSlop={8}
          >
            <ChevronLeft size={24} color={colors.amber[400]} />
          </Pressable>
          <Text className="font-body-medium text-lg text-white">{monthLabel}</Text>
          <Pressable
            onPress={() => goMonth(1)}
            className="rounded-md p-2 active:opacity-80"
            hitSlop={8}
          >
            <ChevronRight size={24} color={colors.amber[400]} />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-4 pt-2">
        {isLoading && (
          <View className="items-center py-8">
            <ActivityIndicator color={colors.amber[400]} />
          </View>
        )}
        {error && (
          <Text className="font-body text-sm text-danger">{error.message}</Text>
        )}
        {!isLoading && !error && transactions?.length === 0 && (
          <Text className="font-body text-sm text-violet-300">
            No transactions for this month
          </Text>
        )}
        {!isLoading && transactions && transactions.length > 0 && (
          <FlatList
            data={transactions}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TransactionRow
                transaction={item}
                onPress={() => openTransaction(item)}
                disabled={!userId || item.userId !== userId}
              />
            )}
            contentContainerClassName="pb-8"
          />
        )}
      </View>
    </SafeAreaView>
  )
}

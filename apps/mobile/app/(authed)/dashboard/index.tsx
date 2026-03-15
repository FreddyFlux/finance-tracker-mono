import { Link, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { useAnnualCashflow } from '@money-saver/api-client'
import numeral from 'numeral'
import { CURRENCY_SYMBOL } from '@money-saver/validations'
import { CashflowChart } from '../../../components/CashflowChart'
import { UserFilter } from '../../../components/UserFilter'

function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL} ${numeral(amount).format('0,0')}`
}

export default function DashboardHome() {
  const router = useRouter()
  const { getToken, userId } = useAuth()
  const { data: token } = useQuery({
    queryKey: ['clerk-token'],
    queryFn: () => getToken(),
  })
  const [selectedUserIds, setSelectedUserIds] = useState<string[] | undefined>(
    userId ? [userId] : undefined,
  )

  useEffect(() => {
    if (userId && (!selectedUserIds || selectedUserIds.length === 0)) {
      setSelectedUserIds([userId])
    }
  }, [userId])

  const currentYear = new Date().getFullYear()
  const onMonthPress = useCallback(
    (month: number) => {
      router.push({
        pathname: '/(authed)/dashboard/transactions',
        params: { month: String(month), year: String(currentYear) },
      })
    },
    [router, currentYear],
  )
  const { data: cashflow, isLoading, error } = useAnnualCashflow(
    currentYear,
    token ?? null,
    selectedUserIds,
  )

  const totalIncome = cashflow?.reduce((sum, m) => sum + m.income, 0) ?? 0
  const totalExpense = cashflow?.reduce((sum, m) => sum + m.expense, 0) ?? 0
  const balance = totalIncome - totalExpense

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 p-6">
        <Text className="mb-6 text-2xl font-bold text-gray-900">Dashboard</Text>

        <View className="mb-5 flex-row items-end gap-3">
          <View className="flex-1">
            <UserFilter
              value={selectedUserIds}
              onChange={setSelectedUserIds}
            />
          </View>
        </View>

        {isLoading && (
          <Text className="mb-4 text-gray-500">Loading cashflow...</Text>
        )}
        {error && (
          <Text className="mb-4 text-red-500">
            Failed to load cashflow: {error.message}
          </Text>
        )}
        {cashflow && (
          <View className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <Text className="mb-2 text-sm text-gray-500">
              Cashflow {currentYear}
            </Text>
            <CashflowChart
              data={cashflow}
              year={currentYear}
              onMonthPress={onMonthPress}
            />
            <View className="mt-4 border-t border-gray-100 pt-4">
              <Text className="text-sm text-gray-500">
                Income: {formatCurrency(totalIncome)}
              </Text>
              <Text className="text-sm text-gray-500">
                Expenses: {formatCurrency(totalExpense)}
              </Text>
              <Text
                className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-orange-600'}`}
              >
                Balance: {formatCurrency(balance)}
              </Text>
            </View>
          </View>
        )}

        <View className="gap-3">
          <Link href="/(authed)/dashboard/transactions" asChild>
            <Pressable className="rounded-lg border border-gray-200 bg-white px-4 py-3 active:opacity-80">
              <Text className="font-medium text-gray-800">Transactions</Text>
            </Pressable>
          </Link>
          <Link href="/(authed)/dashboard/connections" asChild>
            <Pressable className="rounded-lg border border-gray-200 bg-white px-4 py-3 active:opacity-80">
              <Text className="font-medium text-gray-800">Connections</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

import { useAnnualCashflow } from '@money-saver/api-client'
import { CURRENCY_SYMBOL } from '@money-saver/validations'
import { useAuth } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { Link, useRouter } from 'expo-router'
import numeral from 'numeral'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
      <View className="flex-1 p-6">
        <Text className="mb-6 font-display-medium text-2xl text-white">Dashboard</Text>

        {/* Same pattern as chart → Transactions: one column, gap-6 between major blocks */}
        <View className="gap-6">
          <UserFilter value={selectedUserIds} onChange={setSelectedUserIds} />

          {isLoading && (
            <Text className="font-body text-sm text-violet-300">Loading cashflow...</Text>
          )}
          {error && (
            <Text className="font-body text-sm text-danger">
              Failed to load cashflow: {error.message}
            </Text>
          )}
          {cashflow && (
            <View className="rounded-lg border border-violet-700 bg-violet-900 p-4 shadow-md">
              <Text className="mb-2 font-body text-xs uppercase tracking-wide text-violet-300">
                Cashflow {currentYear}
              </Text>
              <CashflowChart
                data={cashflow}
                year={currentYear}
                onMonthPress={onMonthPress}
              />
              <View className="mt-4 border-t border-violet-700 pt-4">
                <Text className="font-body text-sm text-amber-400">
                  Income: {formatCurrency(totalIncome)}
                </Text>
                <Text className="font-body text-sm text-pink-300">
                  Expenses: {formatCurrency(totalExpense)}
                </Text>
                <Text
                  className={`font-display text-md ${balance >= 0 ? 'text-amber-400' : 'text-pink-300'}`}
                >
                  Balance: {formatCurrency(balance)}
                </Text>
              </View>
            </View>
          )}

          <View className="gap-3">
            <Link href="/(authed)/dashboard/transactions" asChild>
              <Pressable className="rounded-lg border border-violet-700 bg-violet-900 px-4 py-3 shadow-md active:opacity-90">
                <Text className="font-body-medium text-white">Transactions</Text>
              </Pressable>
            </Link>
            <Link href="/(authed)/dashboard/connections" asChild>
              <Pressable className="rounded-lg border border-violet-700 bg-violet-900 px-4 py-3 shadow-md active:opacity-90">
                <Text className="font-body-medium text-white">Connections</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

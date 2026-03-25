import { useAnnualCashflow } from '@money-saver/api-client'
import { CURRENCY_SYMBOL } from '@money-saver/validations'
import { useAuth } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { Link, useRouter } from 'expo-router'
import { format } from 'date-fns'
import numeral from 'numeral'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CashflowChart, type CashflowChartPoint } from '../../../components/CashflowChart'
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

  /** First month of the rolling 6-month window (may be in the previous calendar year). */
  const needsPrevYearCashflow = useMemo(() => {
    const now = new Date()
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return windowStart.getFullYear() < now.getFullYear()
  }, [])

  const onMonthPress = useCallback(
    (month: number, year: number) => {
      router.push({
        pathname: '/(authed)/dashboard/transactions',
        params: { month: String(month), year: String(year) },
      })
    },
    [router],
  )

  const { data: cashflowThisYear, isLoading: loadingThisYear, error: errorThisYear } =
    useAnnualCashflow(currentYear, token ?? null, selectedUserIds)

  const { data: cashflowPrevYear, isLoading: loadingPrevYear, error: errorPrevYear } =
    useAnnualCashflow(currentYear - 1, token ?? null, selectedUserIds, {
      enabled: needsPrevYearCashflow,
    })

  const isLoading = loadingThisYear || (needsPrevYearCashflow && loadingPrevYear)
  const error = errorThisYear ?? errorPrevYear

  const chartCashflow = useMemo((): CashflowChartPoint[] | undefined => {
    if (!cashflowThisYear) return undefined
    if (needsPrevYearCashflow && !cashflowPrevYear) return undefined

    const get = (year: number, month: number) => {
      const arr = year === currentYear ? cashflowThisYear : cashflowPrevYear
      if (!arr) return { income: 0, expense: 0 }
      const row = arr.find((m) => m.month === month)
      return { income: row?.income ?? 0, expense: row?.expense ?? 0 }
    }

    const out: CashflowChartPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - i)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const vals = get(y, m)
      out.push({ year: y, month: m, ...vals })
    }
    return out
  }, [cashflowThisYear, cashflowPrevYear, needsPrevYearCashflow, currentYear])

  const cashflowPeriodLabel = useMemo(() => {
    if (!chartCashflow?.length) return String(currentYear)
    const start = chartCashflow[0]!
    const end = chartCashflow[chartCashflow.length - 1]!
    if (start.year === end.year && start.month === end.month) {
      return format(new Date(start.year, start.month - 1, 1), 'MMMM yyyy')
    }
    if (start.year === end.year) {
      return `${format(new Date(start.year, start.month - 1, 1), 'MMM')}–${format(new Date(end.year, end.month - 1, 1), 'MMM')} ${start.year}`
    }
    return `${format(new Date(start.year, start.month - 1, 1), 'MMM yyyy')}–${format(new Date(end.year, end.month - 1, 1), 'MMM yyyy')}`
  }, [chartCashflow, currentYear])

  const totalIncome = chartCashflow?.reduce((sum, m) => sum + m.income, 0) ?? 0
  const totalExpense = chartCashflow?.reduce((sum, m) => sum + m.expense, 0) ?? 0
  const balance = totalIncome - totalExpense

  return (
    <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
      <View className="flex-1 p-6">
        <Text className="mb-6 font-display-medium text-2xl text-white">Dashboard</Text>

        {/* Same pattern as chart -> Transactions: one column, gap-6 between major blocks */}
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
          {cashflowThisYear && chartCashflow && (
            <View className="rounded-lg border border-violet-700 bg-violet-900 p-4 shadow-md">
              <Text className="mb-2 font-body text-xs uppercase tracking-wide text-violet-300">
                Cashflow · {cashflowPeriodLabel}
              </Text>
              <CashflowChart data={chartCashflow} onMonthPress={onMonthPress} />
              <View className="mt-4 border-t border-violet-700 pt-4">
                <Text className="font-body text-sm text-amber-400">
                  Income: {formatCurrency(totalIncome)}
                </Text>
                <Text className="font-body text-sm text-pink-300">
                  Expenses: {formatCurrency(totalExpense)}
                </Text>
                <Text
                  className={
                    balance >= 0
                      ? 'font-display text-md text-amber-400'
                      : 'font-display text-md text-pink-300'
                  }
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

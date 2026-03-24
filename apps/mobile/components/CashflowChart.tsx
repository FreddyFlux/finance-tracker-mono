import type { MonthlyCashflow } from '@money-saver/api-client'
import { colors, CURRENCY_SYMBOL } from '@money-saver/validations'
import { format } from 'date-fns'
import numeral from 'numeral'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import { matchFont, Rect } from '@shopify/react-native-skia'
import { BarGroup, CartesianChart, useChartPressState } from 'victory-native'

const INCOME_COLOR = colors.amber[500]
const EXPENSE_COLOR = colors.pink[500]

function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${numeral(amount).format('0,0')}`
}

export function CashflowChart({
  data,
  year,
  onMonthPress,
}: {
  data: MonthlyCashflow[]
  year: number
  onMonthPress?: (month: number) => void
}) {
  const font = useMemo(
    () =>
      matchFont({
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        fontWeight: '400',
      }),
    [],
  )

  const { state: pressState } = useChartPressState<{
    x: number
    y: { income: number; expense: number }
  }>({
    x: 1,
    y: { income: 0, expense: 0 },
  })

  const [tooltipData, setTooltipData] = useState<MonthlyCashflow | null>(null)

  useAnimatedReaction(
    () => pressState.isActive.value,
    (active) => {
      if (active) {
        const idx = pressState.matchedIndex.value
        runOnJS(setTooltipData)(idx >= 0 && idx < data.length ? data[idx] : null)
      }
    },
    [data],
  )

  const dismissTooltip = useCallback(() => setTooltipData(null), [])

  const handleViewTransactions = useCallback(() => {
    if (tooltipData && onMonthPress) {
      onMonthPress(tooltipData.month)
    }
    setTooltipData(null)
  }, [tooltipData, onMonthPress])

  const axisOptions = useMemo(
    () => ({
      font,
      tickCount: { x: 6, y: 5 },
      formatXLabel: (value: number) =>
        format(new Date(year, Number(value) - 1, 1), 'MMM'),
      formatYLabel: (value: number) =>
        `${CURRENCY_SYMBOL}${numeral(value).format('0,0')}`,
      labelColor: colors.violet[300],
      axisSide: { x: 'bottom' as const, y: 'left' as const },
      labelPosition: { x: 'outset' as const, y: 'outset' as const },
    }),
    [font, year],
  )

  const domainPadding = useMemo(
    () => ({ left: 1, right: 1, top: 0.05, bottom: 0.05 }),
    [],
  )

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: INCOME_COLOR }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: EXPENSE_COLOR }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <CartesianChart
          data={data}
          xKey="month"
          yKeys={['income', 'expense']}
          axisOptions={axisOptions}
          domainPadding={domainPadding}
          chartPressState={pressState}
          chartPressConfig={{
            pan: { activateAfterLongPress: 50 },
          }}
          padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {({ points, chartBounds }) => (
            <Fragment>
              <Rect
                x={chartBounds.left}
                y={chartBounds.top}
                width={chartBounds.right - chartBounds.left}
                height={chartBounds.bottom - chartBounds.top}
                color={colors.violet[900]}
              />
              <BarGroup
                chartBounds={chartBounds}
                betweenGroupPadding={0.2}
                withinGroupPadding={0.1}
              >
                <BarGroup.Bar points={points.income} color={INCOME_COLOR} />
                <BarGroup.Bar points={points.expense} color={EXPENSE_COLOR} />
              </BarGroup>
            </Fragment>
          )}
        </CartesianChart>
      </View>

      <Modal visible={!!tooltipData} transparent animationType="fade">
        <View style={styles.tooltipOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissTooltip} />
          <View style={styles.tooltip}>
            <Text style={styles.tooltipMonth}>
              {tooltipData
                ? format(new Date(year, tooltipData.month - 1, 1), 'MMMM yyyy')
                : ''}
            </Text>
            <View style={styles.tooltipRow}>
              <Text style={[styles.tooltipLabel, { color: INCOME_COLOR }]}>Income:</Text>
              <Text style={styles.tooltipValue}>
                {tooltipData ? formatCurrency(tooltipData.income) : ''}
              </Text>
            </View>
            <View style={styles.tooltipRow}>
              <Text style={[styles.tooltipLabel, { color: EXPENSE_COLOR }]}>Expenses:</Text>
              <Text style={styles.tooltipValue}>
                {tooltipData ? formatCurrency(tooltipData.expense) : ''}
              </Text>
            </View>
            {onMonthPress && (
              <Pressable style={styles.viewTransactionsButton} onPress={handleViewTransactions}>
                <Text style={styles.viewTransactionsText}>View transactions</Text>
              </Pressable>
            )}
            {!onMonthPress && (
              <Text style={styles.tooltipHint}>Tap outside to close</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 320,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: colors.violet[200],
  },
  chartWrapper: {
    height: 280,
    backgroundColor: colors.violet[900],
    borderRadius: 10,
    overflow: 'hidden',
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 18, 53, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tooltip: {
    backgroundColor: colors.violet[900],
    borderRadius: 16,
    padding: 16,
    minWidth: 200,
    borderWidth: 0.5,
    borderColor: colors.violet[700],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  tooltipMonth: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_500Medium',
    color: colors.violet[100],
    marginBottom: 12,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tooltipLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  tooltipValue: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: colors.violet[100],
  },
  tooltipHint: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: colors.violet[400],
    marginTop: 12,
    textAlign: 'center',
  },
  viewTransactionsButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.violet[600],
    borderRadius: 9999,
    alignItems: 'center',
  },
  viewTransactionsText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#FFFFFF',
  },
})

import type { MonthlyCashflow } from '@money-saver/api-client'
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans'
import { colors, CURRENCY_SYMBOL } from '@money-saver/validations'
import { format } from 'date-fns'
import numeral from 'numeral'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import {
  Group,
  LinearGradient,
  Line,
  Rect,
  useFont,
  vec,
} from '@shopify/react-native-skia'
import { BarGroup, CartesianChart, useChartPressState } from 'victory-native'

/** Slightly richer than flat fills — reads better on dark gradient */
const INCOME_COLOR = colors.amber[500]
const EXPENSE_COLOR = colors.pink[500]

const BAR_TOP_RADIUS = 6

/** Enough output padding so the first/last bar group is not clipped (bars extend groupWidth/2 past each tick). */
const DOMAIN_PAD_X = 40

const TICK_LEN = 5
const GRID_Y = 'rgba(186, 159, 216, 0.34)'
const GRID_X = 'rgba(186, 159, 216, 0.22)'
const TICK_STROKE = 'rgba(212, 196, 235, 0.95)'

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
  /**
   * Skia cannot use `matchFont` with Expo font family names — it needs the bundled TTF via `useFont`.
   * Without this, axis labels are omitted while grid/ticks still render.
   */
  const axisFont = useFont(DMSans_400Regular, 11)

  const chartSurfaceColors = useMemo(
    () => [colors.violet[900], colors.violet[800]],
    [],
  )

  const axisTickMarks = useCallback(
    (args: {
      xScale: (n: number) => number
      yScale: (n: number) => number
      xTicks: number[]
      yTicks: number[]
      chartBounds: { left: number; right: number; top: number; bottom: number }
    }) => {
      const { xScale, yScale, xTicks, yTicks, chartBounds } = args
      return (
        <Group>
          {xTicks.map((tick) => {
            const x = xScale(tick)
            if (x < chartBounds.left || x > chartBounds.right) return null
            return (
              <Line
                key={`xtick-${tick}`}
                p1={vec(x, chartBounds.bottom)}
                p2={vec(x, chartBounds.bottom + TICK_LEN)}
                color={TICK_STROKE}
                strokeWidth={1}
              />
            )
          })}
          {yTicks.map((tick) => {
            const y = yScale(tick)
            if (y < chartBounds.top || y > chartBounds.bottom) return null
            return (
              <Line
                key={`ytick-${tick}`}
                p1={vec(chartBounds.left - TICK_LEN, y)}
                p2={vec(chartBounds.left, y)}
                color={TICK_STROKE}
                strokeWidth={1}
              />
            )
          })}
        </Group>
      )
    },
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
      font: axisFont ?? undefined,
      tickCount: { x: 12, y: 5 },
      formatXLabel: (value: number) =>
        format(new Date(year, Number(value) - 1, 1), 'MMM'),
      formatYLabel: (value: number) =>
        `${CURRENCY_SYMBOL}${numeral(value).format('0,0')}`,
      labelColor: { x: colors.violet[200], y: colors.violet[300] },
      lineColor: {
        grid: {
          x: GRID_X,
          y: GRID_Y,
        },
        frame: 'rgba(123, 92, 200, 0.35)',
      },
      lineWidth: {
        grid: { x: 1, y: 1 },
        frame: 1,
      },
      axisSide: { x: 'bottom' as const, y: 'left' as const },
      labelPosition: { x: 'outset' as const, y: 'outset' as const },
      labelOffset: { x: 0, y: 6 },
    }),
    [axisFont, year],
  )

  const domainPadding = useMemo(
    () => ({
      left: DOMAIN_PAD_X,
      right: DOMAIN_PAD_X,
      top: 16,
      bottom: 4,
    }),
    [],
  )

  const xDomain = useMemo(() => ({ x: [1, 12] as [number, number] }), [])

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendPill}>
          <View style={[styles.legendSwatch, { backgroundColor: INCOME_COLOR }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendPill}>
          <View style={[styles.legendSwatch, { backgroundColor: EXPENSE_COLOR }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <CartesianChart
          data={data}
          xKey="month"
          yKeys={['income', 'expense']}
          axisOptions={axisOptions}
          domain={xDomain}
          domainPadding={domainPadding}
          renderOutside={axisTickMarks}
          chartPressState={pressState}
          chartPressConfig={{
            pan: { activateAfterLongPress: 50 },
          }}
          padding={{ top: 12, bottom: 32, left: 8, right: 12 }}
        >
          {({ points, chartBounds }) => {
            const w = chartBounds.right - chartBounds.left
            const h = chartBounds.bottom - chartBounds.top
            return (
              <Fragment>
                <Rect
                  x={chartBounds.left}
                  y={chartBounds.top}
                  width={w}
                  height={h}
                >
                  <LinearGradient
                    start={vec(chartBounds.left, chartBounds.top)}
                    end={vec(chartBounds.left, chartBounds.bottom)}
                    colors={chartSurfaceColors}
                  />
                </Rect>
                <BarGroup
                  chartBounds={chartBounds}
                  betweenGroupPadding={0.22}
                  withinGroupPadding={0.12}
                  roundedCorners={{
                    topLeft: BAR_TOP_RADIUS,
                    topRight: BAR_TOP_RADIUS,
                  }}
                >
                  <BarGroup.Bar points={points.income} color={INCOME_COLOR} />
                  <BarGroup.Bar points={points.expense} color={EXPENSE_COLOR} />
                </BarGroup>
              </Fragment>
            )
          }}
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
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(123, 92, 200, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(186, 159, 216, 0.25)',
  },
  legendSwatch: {
    width: 8,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: colors.violet[200],
    letterSpacing: 0.2,
  },
  chartWrapper: {
    height: 280,
    backgroundColor: colors.violet[900],
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(186, 159, 216, 0.2)',
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

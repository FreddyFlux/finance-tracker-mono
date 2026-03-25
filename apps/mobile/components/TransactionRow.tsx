import type { Transaction } from '@money-saver/api-client'
import { CURRENCY_SYMBOL } from '@money-saver/validations'
import { format } from 'date-fns'
import numeral from 'numeral'
import { Pressable, Text, View } from 'react-native'

function formatCurrency(amount: string, transactionType: 'income' | 'expense'): string {
  const n = Number(amount)
  const abs = numeral(Math.abs(n)).format('0,0')
  const prefix = transactionType === 'income' ? '+' : '−'
  return `${prefix}${CURRENCY_SYMBOL} ${abs}`
}

export function TransactionRow({
  transaction,
  variant = 'default',
  onPress,
  disabled,
}: {
  transaction: Transaction
  variant?: 'compact' | 'default'
  onPress?: () => void
  disabled?: boolean
}) {
  const dateLabel = format(new Date(transaction.transactionDate), 'd MMM yyyy')
  const amountColor =
    transaction.transactionType === 'income' ? 'text-amber-400' : 'text-pink-300'
  const pad = variant === 'compact' ? 'py-2.5' : 'py-3'

  const inner = (
    <View className={`flex-row items-start gap-3 border-b border-violet-700/40 ${pad}`}>
      <View className="min-w-0 flex-1">
        <Text className="font-body text-xs text-violet-300">{dateLabel}</Text>
        <Text
          className="font-body-medium mt-0.5 text-white"
          numberOfLines={variant === 'compact' ? 1 : undefined}
        >
          {transaction.description}
        </Text>
        {transaction.category ? (
          <Text className="font-body mt-0.5 text-sm text-violet-200" numberOfLines={1}>
            {transaction.category}
          </Text>
        ) : null}
      </View>
      <Text className={`font-body-medium shrink-0 ${amountColor}`}>
        {formatCurrency(transaction.amount, transaction.transactionType)}
      </Text>
    </View>
  )

  if (onPress && !disabled) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {inner}
      </Pressable>
    )
  }

  return inner
}

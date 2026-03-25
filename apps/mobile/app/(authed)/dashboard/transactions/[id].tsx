import {
  useCategories,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@money-saver/api-client'
import { colors, TRANSACTION_LIMITS } from '@money-saver/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { addDays, format, parse } from 'date-fns'
import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

const editSchema = z.object({
  transactionType: z.enum(['income', 'expense']),
  categoryId: z.number().positive('Select a category'),
  transactionDate: z.string().min(1),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z
    .string()
    .min(
      TRANSACTION_LIMITS.DESCRIPTION_MIN_LENGTH,
      `At least ${TRANSACTION_LIMITS.DESCRIPTION_MIN_LENGTH} characters`,
    )
    .max(TRANSACTION_LIMITS.DESCRIPTION_MAX_LENGTH),
})

type EditForm = z.infer<typeof editSchema>

function parseId(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

export default function TransactionDetailScreen() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { data: token } = useQuery({
    queryKey: ['clerk-token'],
    queryFn: () => getToken(),
  })

  const { id: idParam } = useLocalSearchParams<{ id: string }>()
  const id = parseId(idParam)

  const { data: transaction, isLoading, error } = useTransaction(id, token ?? null)
  const { data: categories } = useCategories(token ?? null)
  const updateMutation = useUpdateTransaction(token ?? null)
  const deleteMutation = useDeleteTransaction(token ?? null)

  const [showDatePicker, setShowDatePicker] = useState(false)

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    mode: 'onSubmit',
    defaultValues: {
      transactionType: 'expense',
      categoryId: 0,
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      description: '',
    },
  })

  const { control, handleSubmit, reset, watch, setValue } = form
  const transactionType = watch('transactionType')
  const transactionDate = watch('transactionDate')
  const categoryId = watch('categoryId')

  const categoriesForType = useMemo(
    () => categories?.filter((c) => c.type === transactionType) ?? [],
    [categories, transactionType],
  )

  useEffect(() => {
    if (!transaction) return
    reset({
      transactionType: transaction.transactionType,
      categoryId: transaction.categoryId,
      transactionDate: transaction.transactionDate,
      amount: Number(transaction.amount),
      description: transaction.description,
    })
  }, [transaction, reset])

  useEffect(() => {
    if (!categoriesForType.length) return
    if (!categoriesForType.some((c) => c.id === categoryId)) {
      setValue('categoryId', categoriesForType[0]!.id, { shouldValidate: true })
    }
  }, [transactionType, categoriesForType, categoryId, setValue])

  const dateValue = useMemo(() => {
    try {
      const d = parse(transactionDate, 'yyyy-MM-dd', new Date())
      return Number.isNaN(d.getTime()) ? new Date() : d
    } catch {
      return new Date()
    }
  }, [transactionDate])

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync({ id, ...values })
    router.back()
  })

  const onDelete = () => {
    Alert.alert(
      'Delete transaction',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(id)
            router.back()
          },
        },
      ],
    )
  }

  const onDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (selected) {
      setValue('transactionDate', format(selected, 'yyyy-MM-dd'), { shouldValidate: true })
    }
  }

  if (!Number.isFinite(id)) {
    return (
      <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
        <Text className="p-4 font-body text-danger">Invalid transaction</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
      <View className="border-b border-violet-700/50 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1 rounded-md py-1 active:opacity-80"
            hitSlop={8}
          >
            <ChevronLeft size={22} color={colors.amber[400]} />
            <Text className="font-body-medium text-amber-400">Back</Text>
          </Pressable>
        </View>
        <Text className="mt-3 font-display-medium text-2xl text-white">Edit transaction</Text>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.amber[400]} />
        </View>
      )}

      {error && !isLoading && (
        <View className="p-4">
          <Text className="font-body text-danger">
            {error.message || 'Could not load transaction'}
          </Text>
          <Link href="/(authed)/dashboard/transactions" asChild>
            <Pressable className="mt-4">
              <Text className="font-body-medium text-amber-400">Back to list</Text>
            </Pressable>
          </Link>
        </View>
      )}

      {transaction && !isLoading && !error && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-10"
        >
          <View className="mb-4 flex-row gap-2">
            <Controller
              control={control}
              name="transactionType"
              render={({ field: { onChange, value } }) => (
                <>
                  <Pressable
                    onPress={() => onChange('income')}
                    className={`flex-1 rounded-lg border px-3 py-2 ${
                      value === 'income'
                        ? 'border-amber-400 bg-violet-900'
                        : 'border-violet-600 bg-violet-900/50'
                    }`}
                  >
                    <Text className="text-center font-body-medium text-white">Income</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onChange('expense')}
                    className={`flex-1 rounded-lg border px-3 py-2 ${
                      value === 'expense'
                        ? 'border-pink-300 bg-violet-900'
                        : 'border-violet-600 bg-violet-900/50'
                    }`}
                  >
                    <Text className="text-center font-body-medium text-white">Expense</Text>
                  </Pressable>
                </>
              )}
            />
          </View>

          <Text className="mb-1 font-body text-xs uppercase tracking-wide text-violet-300">
            Category
          </Text>
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4 flex-row flex-wrap gap-2">
                {categoriesForType.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => onChange(c.id)}
                    className={`rounded-full border px-3 py-1.5 ${
                      value === c.id
                        ? 'border-amber-400 bg-violet-900'
                        : 'border-violet-600 bg-violet-950'
                    }`}
                  >
                    <Text className="font-body text-sm text-white">{c.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          />

          <Text className="mb-1 font-body text-xs uppercase tracking-wide text-violet-300">
            Date
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="mb-4 rounded-lg border border-violet-600 bg-violet-950 px-3 py-3"
          >
            <Text className="font-body text-white">
              {format(dateValue, 'd MMM yyyy')}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
              maximumDate={addDays(new Date(), 1)}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <Pressable
              onPress={() => setShowDatePicker(false)}
              className="mb-4 self-end"
            >
              <Text className="font-body-medium text-amber-400">Done</Text>
            </Pressable>
          )}

          <Text className="mb-1 font-body text-xs uppercase tracking-wide text-violet-300">
            Amount
          </Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="mb-2 rounded-lg border border-violet-600 bg-violet-950 px-3 py-3 font-body text-white"
                keyboardType="decimal-pad"
                onChangeText={(t) => {
                  const cleaned = t.replace(/[^0-9.,]/g, '')
                  if (cleaned === '' || cleaned === '.' || cleaned === ',') {
                    onChange(0)
                    return
                  }
                  const n = parseFloat(cleaned.replace(',', '.'))
                  if (!Number.isNaN(n)) onChange(n)
                }}
                onBlur={onBlur}
                value={!value || value === 0 ? '' : String(value)}
                placeholder="0"
                placeholderTextColor={colors.violet[300]}
              />
            )}
          />

          <Text className="mb-1 font-body text-xs uppercase tracking-wide text-violet-300">
            Description
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="mb-4 min-h-[100px] rounded-lg border border-violet-600 bg-violet-950 px-3 py-3 font-body text-white"
                multiline
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholderTextColor={colors.violet[300]}
              />
            )}
          />

          {updateMutation.error && (
            <Text className="mb-2 font-body text-sm text-danger">
              {updateMutation.error.message}
            </Text>
          )}

          <Pressable
            onPress={onSubmit}
            disabled={updateMutation.isPending}
            className="mb-3 rounded-lg bg-amber-500 px-4 py-3 active:opacity-90 disabled:opacity-50"
          >
            <Text className="text-center font-body-medium text-violet-900">
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onDelete}
            disabled={deleteMutation.isPending}
            className="rounded-lg border border-danger py-3 active:opacity-90 disabled:opacity-50"
          >
            <Text className="text-center font-body-medium text-danger">
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

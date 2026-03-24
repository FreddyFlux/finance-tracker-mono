import * as React from 'react'
import { Pressable, Text, type PressableProps } from 'react-native'

export interface ButtonProps extends PressableProps {
  children: React.ReactNode
  variant?: 'default' | 'cta' | 'outline' | 'ghost'
}

export function Button({
  children,
  variant = 'default',
  className,
  ...props
}: ButtonProps) {
  const container =
    variant === 'default'
      ? 'rounded-pill bg-violet-600 active:opacity-90'
      : variant === 'cta'
        ? 'rounded-pill bg-amber-500 active:opacity-90'
        : variant === 'outline'
          ? 'rounded-pill border border-violet-300 bg-transparent active:opacity-90'
          : 'rounded-pill border border-gray-200 bg-transparent active:opacity-90'

  const label =
    variant === 'default'
      ? 'font-body-medium text-base text-white'
      : variant === 'cta'
        ? 'font-body-medium text-base text-violet-900'
        : variant === 'outline'
          ? 'font-body-medium text-base text-violet-600'
          : 'font-body-medium text-base text-gray-600'

  return (
    <Pressable className={`px-4 py-2.5 ${container} ${className ?? ''}`} {...props}>
      {typeof children === 'string' ? (
        <Text className={`text-center ${label}`}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

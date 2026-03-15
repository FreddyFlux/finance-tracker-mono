import * as React from 'react'
import { Pressable, Text, type PressableProps } from 'react-native'

export interface ButtonProps extends PressableProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
}

export function Button({
  children,
  variant = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={`rounded-lg px-4 py-2.5 active:opacity-80 ${
        variant === 'default'
          ? 'bg-gray-900'
          : variant === 'outline'
            ? 'border border-gray-300 bg-white'
            : 'bg-transparent'
      } ${className ?? ''}`}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          className={`font-medium ${
            variant === 'default'
              ? 'text-white'
              : variant === 'outline'
                ? 'text-gray-800'
                : 'text-gray-800'
          }`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

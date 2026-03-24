import { Image, View } from 'react-native'

export interface AvatarProps {
  source?: string | null
  fallback?: React.ReactNode
  size?: number
  className?: string
}

export function Avatar({
  source,
  fallback,
  size = 40,
  className = '',
}: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden' as const,
  }

  if (source) {
    return (
      <View style={containerStyle} className={`border-2 border-violet-700 ${className}`}>
        <Image
          source={{ uri: source }}
          style={{ width: size, height: size }}
          accessibilityLabel="User avatar"
        />
      </View>
    )
  }

  return (
    <View
      style={containerStyle}
      className={`items-center justify-center border-2 border-violet-700 bg-violet-100 ${className}`}
    >
      {fallback}
    </View>
  )
}

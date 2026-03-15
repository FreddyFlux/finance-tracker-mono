import { Image, View } from 'react-native'

export interface AvatarProps {
  /** Image source URL (e.g. from Clerk user.imageUrl) */
  source?: string | null
  /** Fallback when no image - renders initials or placeholder */
  fallback?: React.ReactNode
  /** Size in pixels */
  size?: number
  /** Additional class names */
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
      <View style={containerStyle} className={className}>
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
      className={`items-center justify-center bg-gray-300 ${className}`}
    >
      {fallback}
    </View>
  )
}

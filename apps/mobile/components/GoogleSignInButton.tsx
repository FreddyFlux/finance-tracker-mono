import { useSSO } from '@clerk/expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Alert, Platform, Pressable, Text } from 'react-native'
import { colors } from '@money-saver/validations'

interface GoogleSignInButtonProps {
  label?: 'Sign in with Google' | 'Sign up with Google'
  onSuccess?: () => void
}

export function GoogleSignInButton({
  label = 'Sign in with Google',
  onSuccess,
}: GoogleSignInButtonProps) {
  const { startSSOFlow } = useSSO()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handlePress = async () => {
    if (Platform.OS === 'web' || loading) return

    setLoading(true)
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      })

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        if (onSuccess) {
          onSuccess()
        } else {
          router.replace('/(authed)/dashboard')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during Google sign-in'
      Alert.alert('Error', message)
      console.error('Google sign-in error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (Platform.OS === 'web') {
    return null
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className={`rounded-pill border border-gray-200 bg-white px-6 py-3 active:opacity-90 ${loading ? 'opacity-70' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.violet[600]} />
      ) : (
        <Text className="text-center font-body-medium text-base text-gray-900">{label}</Text>
      )}
    </Pressable>
  )
}

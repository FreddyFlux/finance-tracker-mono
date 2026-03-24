import { useSignIn } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GoogleSignInButton } from '../../components/GoogleSignInButton'
import { colors } from '@money-saver/validations'

const placeholderColor = colors.gray[400]

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      identifier: emailAddress,
      password,
    })
    if (error) return

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return
          router.replace('/(authed)/dashboard')
        },
      })
    } else if (
      signIn.status === 'needs_second_factor' ||
      signIn.status === 'needs_client_trust'
    ) {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code',
      )
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode()
      }
    }
  }

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code })

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return
          router.replace('/(authed)/dashboard')
        },
      })
    }
  }

  if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="mb-2 font-display-medium text-2xl text-white">
              Verify your account
            </Text>
            <Text className="font-body text-sm text-violet-200">
              Enter the verification code from your email
            </Text>
            <TextInput
              className="rounded-md border border-gray-200 bg-white px-4 py-3 font-body text-base text-gray-900"
              value={code}
              placeholder="Enter your verification code"
              placeholderTextColor={placeholderColor}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            {errors.fields?.code && (
              <Text className="font-body text-sm text-danger">{errors.fields.code.message}</Text>
            )}
            <Pressable
              onPress={handleVerify}
              disabled={fetchStatus === 'fetching'}
              className={`mt-2 rounded-pill bg-violet-600 px-6 py-3 ${fetchStatus === 'fetching' ? 'opacity-50' : ''} active:opacity-90`}
            >
              <Text className="text-center font-body-medium text-base text-white">Verify</Text>
            </Pressable>
            <Pressable onPress={() => signIn.mfa.sendEmailCode()} className="mt-2 rounded-pill px-6 py-3 active:opacity-80">
              <Text className="text-center font-body-medium text-amber-400">I need a new code</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-violet-800" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-2 font-display-medium text-2xl text-white">Sign in</Text>

          <GoogleSignInButton label="Sign in with Google" />

          <View className="my-4 flex-row items-center gap-2">
            <View className="h-px flex-1 bg-violet-600" />
            <Text className="font-body text-xs text-violet-400">or</Text>
            <View className="h-px flex-1 bg-violet-600" />
          </View>

          <Text className="font-body-medium text-sm text-violet-200">Email address</Text>
          <TextInput
            className="rounded-md border border-gray-200 bg-white px-4 py-3 font-body text-base text-gray-900"
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor={placeholderColor}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          {errors.fields?.identifier && (
            <Text className="font-body text-sm text-danger">{errors.fields.identifier.message}</Text>
          )}
          <Text className="font-body-medium text-sm text-violet-200">Password</Text>
          <TextInput
            className="rounded-md border border-gray-200 bg-white px-4 py-3 font-body text-base text-gray-900"
            value={password}
            placeholder="Enter password"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            onChangeText={setPassword}
          />
          {errors.fields?.password && (
            <Text className="font-body text-sm text-danger">{errors.fields.password.message}</Text>
          )}
          <Pressable
            onPress={handleSubmit}
            disabled={!emailAddress || !password || fetchStatus === 'fetching'}
            className={`mt-2 rounded-pill bg-violet-600 px-6 py-3 ${!emailAddress || !password || fetchStatus === 'fetching' ? 'opacity-50' : ''} active:opacity-90`}
          >
            <Text className="text-center font-body-medium text-base text-white">Continue</Text>
          </Pressable>

          <View className="mt-4 flex-row flex-wrap items-center gap-1">
            <Text className="font-body text-violet-200">Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text className="font-body-medium text-amber-400">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

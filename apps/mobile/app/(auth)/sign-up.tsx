import { useAuth, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { GoogleSignInButton } from '../../components/GoogleSignInButton'
import {
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    })
    if (error) return

    if (!error) await signUp.verifications.sendEmailCode()
  }

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code })
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return
          router.replace('/(authed)/dashboard')
        },
      })
    }
  }

  if (signUp.status === 'complete' || isSignedIn) {
    return null
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-2 text-2xl font-bold text-gray-900">
            Verify your account
          </Text>
          <Text className="text-sm font-semibold text-gray-700">
            Enter the code we sent to your email
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor="#666666"
            onChangeText={setCode}
            keyboardType="numeric"
          />
          {errors.fields?.code && (
            <Text className="text-sm text-red-600">{errors.fields.code.message}</Text>
          )}
          <Pressable
            onPress={handleVerify}
            disabled={fetchStatus === 'fetching'}
            className={`mt-2 rounded-lg bg-lime-600 px-6 py-3 ${fetchStatus === 'fetching' ? 'opacity-50' : ''} active:opacity-70`}
          >
            <Text className="text-center font-semibold text-white">Verify</Text>
          </Pressable>
          <Pressable
            onPress={() => signUp.verifications.sendEmailCode()}
            className="mt-2 rounded-lg px-6 py-3 active:opacity-70"
          >
            <Text className="text-center font-semibold text-lime-600">
              I need a new code
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-2xl font-bold text-gray-900">Sign up</Text>

        <GoogleSignInButton label="Sign up with Google" />

        <View className="my-4 flex-row items-center gap-2">
          <View className="h-px flex-1 bg-gray-300" />
          <Text className="text-sm text-gray-500">or</Text>
          <View className="h-px flex-1 bg-gray-300" />
        </View>

        <Text className="text-sm font-semibold text-gray-700">Email address</Text>
        <TextInput
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#666666"
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />
        {errors.fields?.emailAddress && (
          <Text className="text-sm text-red-600">
            {errors.fields.emailAddress.message}
          </Text>
        )}
        <Text className="text-sm font-semibold text-gray-700">Password</Text>
        <TextInput
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#666666"
          secureTextEntry
          onChangeText={setPassword}
        />
        {errors.fields?.password && (
          <Text className="text-sm text-red-600">
            {errors.fields.password.message}
          </Text>
        )}
        <Pressable
          onPress={handleSubmit}
          disabled={!emailAddress || !password || fetchStatus === 'fetching'}
          className={`mt-2 rounded-lg bg-lime-600 px-6 py-3 ${!emailAddress || !password || fetchStatus === 'fetching' ? 'opacity-50' : ''} active:opacity-70`}
        >
          <Text className="text-center font-semibold text-white">Sign up</Text>
        </Pressable>

        <View className="mt-4 flex-row flex-wrap items-center gap-1">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text className="font-semibold text-lime-600">Sign in</Text>
            </Pressable>
          </Link>
        </View>

        {/* Required for Clerk's bot sign-up protection */}
        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

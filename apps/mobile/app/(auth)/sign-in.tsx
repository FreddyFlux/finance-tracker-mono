import { useSignIn } from '@clerk/expo'
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
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }
          router.replace('/(authed)/dashboard')
        },
      })
    } else if (
      signIn.status === 'needs_second_factor' ||
      signIn.status === 'needs_client_trust'
    ) {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code'
      )
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode()
      }
    } else {
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code })

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }
          router.replace('/(authed)/dashboard')
        },
      })
    } else {
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-2 text-2xl font-bold text-gray-900">
            Verify your account
          </Text>
          <Text className="text-sm font-semibold text-gray-700">
            Enter the verification code from your email
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
            onPress={() => signIn.mfa.sendEmailCode()}
            className="mt-2 rounded-lg px-6 py-3 active:opacity-70"
          >
            <Text className="text-center font-semibold text-lime-600">
              I need a new code
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-2xl font-bold text-gray-900">Sign in</Text>

        <GoogleSignInButton label="Sign in with Google" />

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
        {errors.fields?.identifier && (
          <Text className="text-sm text-red-600">
            {errors.fields.identifier.message}
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
          <Text className="text-center font-semibold text-white">Continue</Text>
        </Pressable>

        <View className="mt-4 flex-row flex-wrap items-center gap-1">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text className="font-semibold text-lime-600">Sign up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

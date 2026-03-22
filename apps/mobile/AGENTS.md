# money-saver — Mobile app (`apps/mobile`)

Monorepo-wide rules: **`AGENTS.md`** (repo root). Visual design tokens: **`DESIGN_SYSTEM.md`**.

---

## Framework & routing

- **Expo SDK 55** + **Expo Router v4** (file-based routing, `app/` directory)
- Entry point: `"main": "expo-router/entry"` in `package.json`
- Root layout: `app/_layout.tsx` — wraps with `ClerkProvider` and imports `../global.css`
- Auth guard: `app/(authed)/_layout.tsx` — redirects to `/` if not signed in

---

## Critical: mobile NEVER imports `@money-saver/db`

The db package uses Node.js APIs unavailable in React Native. Mobile communicates with the backend **only via REST API** through `@money-saver/api-client`.

```ts
// ✅ Correct — use the API client
import { useTransactionsByMonth } from '@money-saver/api-client'

// ❌ Never do this in mobile
import { db } from '@money-saver/db'
```

---

## API client & token handling

- All API hooks require a **token** from `useAuth().getToken()`
- **Do not call API hooks when the user is not signed in** — the auth guard should prevent this, but if calling outside guarded routes, pass `null` and handle the disabled state
- Pass token to hooks: `useTransactionsByMonth(year, month, token)`

```tsx
// ✅ Correct — get token and pass to hook
const { getToken } = useAuth()
const { data: token } = useQuery({
  queryKey: ['clerk-token'],
  queryFn: () => getToken(),
})
const { data } = useTransactionsByMonth(year, month, token ?? null)
```

- api-client covers: **transactions**, **cashflow**, **categories**. For **recurring-transactions** and **connections**, add corresponding modules in `packages/api-client` and use the same pattern.

---

## Styling — NativeWind with Tailwind CSS v3

- Mobile uses **Tailwind CSS v3** — NativeWind v4 does NOT support Tailwind v4
- Always use `className` prop (not `style`) for Tailwind utilities
- Import React Native primitives (`View`, `Text`, `Pressable`) not HTML elements
- Font families: extend `tailwind.config.js` per **`DESIGN_SYSTEM.md`** (Cormorant Garamond + DM Sans via `expo-google-fonts`)

```tsx
// ✅ Correct
import { View, Text, Pressable } from 'react-native'
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-lg font-bold text-gray-900">Hello</Text>
</View>

// ❌ Never use HTML elements in React Native
<div className="flex items-center">
```

---

## Design system (mobile)

- Follow **`DESIGN_SYSTEM.md`** for colors, typography, and component semantics
- Implement tokens in `apps/mobile/tailwind.config.js` — keep parity with web where the design system defines shared tokens

---

## Auth in mobile

```tsx
import { useAuth } from '@clerk/expo'

// Get token for API calls
const { getToken } = useAuth()
const token = await getToken()

// Pass to API client
import { apiRequest } from '@money-saver/api-client'
await apiRequest('/api/transactions', { token })
```

---

## Forms in mobile

Use `<Controller>` from react-hook-form — the `register()` API is DOM-only and does not work in React Native:

```tsx
// ✅ Correct
import { useForm, Controller } from 'react-hook-form'
<Controller
  control={control}
  name="amount"
  render={({ field: { onChange, value } }) => (
    <TextInput onChangeText={onChange} value={value} />
  )}
/>

// ❌ Wrong — register() is DOM-only
<TextInput {...register('amount')} />
```

---

## Navigation

Use Expo Router's `Link` and `router` for navigation:

```tsx
import { Link, router } from 'expo-router'
router.push('/(authed)/dashboard')
router.replace('/')
<Link href="/(authed)/dashboard/transactions">Transactions</Link>
```

---

## Icons

```tsx
import { TrendingUp } from 'lucide-react-native'
// lucide-react-native requires react-native-svg
<TrendingUp size={24} color="#000" />
```

---

## Common mistakes (mobile)

| Mistake | Correct approach |
|--------|------------------|
| Using `register()` in RN forms | Use `<Controller>` |
| `tailwindcss@4` in mobile | Keep `tailwindcss@3` in `apps/mobile` |
| HTML elements in RN components | Use `View`, `Text`, `Pressable` |
| `module.exports` before SVG config in metro | Mutate config first, export last |
| `@fontsource/*` for fonts | Use `expo-font` + `useFonts()` |
| `style={{}}` instead of `className` | Use `className` with NativeWind |

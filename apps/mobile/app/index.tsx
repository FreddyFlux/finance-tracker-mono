import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Hello from Expo Router 🎉</Text>
      <Check size={24} color="black" />
    </View>
  );
}
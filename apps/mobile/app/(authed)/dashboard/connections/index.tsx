import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Connections() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View>
        <Text>Connections</Text>
      </View>
    </SafeAreaView>
  );
}

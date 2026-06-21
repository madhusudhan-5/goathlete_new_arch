import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';

export default function App() {
  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Vendor Partner App - Bare RN</Text>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

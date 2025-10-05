import { Tabs } from 'expo-router';
import { Home, Mic, Image, BarChart3, User } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(17, 24, 39, 0.95)', 'rgba(75, 85, 99, 0.95)']}
            style={StyleSheet.absoluteFillObject}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ size, color }) => (
            <Image size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.recordIconContainer}>
              <Mic size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  recordIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
});
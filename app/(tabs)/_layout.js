import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/theme';

const tabIcons = {
  index: ['home', 'home-outline'],
  add: ['add-circle', 'add-circle-outline'],
  statistics: ['analytics', 'analytics-outline'],
  featured: ['flame', 'flame-outline'],
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#8791A4',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 3 },
        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          borderTopColor: COLORS.border,
          backgroundColor: '#FFFFFF',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = tabIcons[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Cửa hàng' }} />
      <Tabs.Screen name="add" options={{ title: 'Thêm máy' }} />
      <Tabs.Screen name="statistics" options={{ title: 'Thống kê' }} />
      <Tabs.Screen name="featured" options={{ title: 'Nổi bật' }} />
    </Tabs>
  );
}

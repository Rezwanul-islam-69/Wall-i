import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView, Animated, Easing, StatusBar } from 'react-native';

import HomeScreen from './app/screens/HomeScreen';
import DepositScreen from './app/screens/DepositScreen';
import ShoppingScreen from './app/screens/ShoppingScreen';
import StatisticsScreen from './app/screens/StatisticsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import BrandLogo from './app/components/BrandLogo';
import { getSettings, AccentColor } from './app/storage/settings';

const Tab = createBottomTabNavigator();

const BASE_COLORS = {
  bg: '#0F0F1E',
  card: '#1A1A2E',
  sub: '#A0A0B0',
};

const ACCENT_COLORS: Record<AccentColor, string> = {
  purple: '#6C63FF',
  cyan: '#57D1FF',
  green: '#4CAF50',
};

type MenuTab = 'App' | 'Settings' | 'About';

interface SplashScreenProps {
  onFinish: () => void;
}

function SplashScreen({ onFinish }: SplashScreenProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 650,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => finished && onFinish());
  }, [onFinish, opacity, scale]);

  return (
    <View style={splashStyles.container}>
      <StatusBar hidden />
      <Animated.View style={[splashStyles.logoWrapper, { transform: [{ scale }], opacity }]}> 
        <BrandLogo size={96} />
      </Animated.View>
      <Text style={splashStyles.message}>Welcome to Wall-i</Text>
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <SafeAreaProvider>
      {ready ? (
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      ) : (
        <SplashScreen onFinish={() => setReady(true)} />
      )}
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTab, setMenuTab] = useState<MenuTab>('App');
  const [accentColor, setAccentColor] = useState<string>('#6C63FF');
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const loadAccent = async () => {
        const settings = await getSettings();
        setAccentColor(ACCENT_COLORS[settings.accent]);
      };
      loadAccent();
    }, [])
  );

  const COLORS = {
    bg: BASE_COLORS.bg,
    card: BASE_COLORS.card,
    accent: accentColor,
    sub: BASE_COLORS.sub,
  };

  const renderMenuContent = () => {
    switch (menuTab) {
      case 'Settings':
        return (
          <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>Settings</Text>
            <Text style={styles.menuText}>Customize your wallet experience.</Text>
            <View style={styles.actionCard}>
              <Text style={styles.actionCardTitle}>Currency</Text>
              <Text style={styles.actionCardDescription}>৳ Bangladeshi Taka is currently active.</Text>
            </View>
            <View style={styles.actionCard}>
              <Text style={styles.actionCardTitle}>Notifications</Text>
              <Text style={styles.actionCardDescription}>Receive spend alerts and deposit updates.</Text>
            </View>
          </View>
        );
      case 'About':
        return (
          <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>About Wall-i</Text>
            <Text style={styles.menuText}>A smart wallet app for tracking spends, deposits, and shopping lists.</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.1.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Built with</Text>
              <Text style={styles.infoValue}>Expo · React Native · SVG</Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.menuSection}>
            <View style={styles.menuHeader}>
              <BrandLogo size={52} />
              <Text style={styles.menuTitle}>Wall-i Hub</Text>
            </View>
            <Text style={styles.menuText}>Quick actions and product overview in one place.</Text>
            <View style={styles.actionCard}>
              <Text style={styles.actionCardTitle}>Your wallet</Text>
              <Text style={styles.actionCardDescription}>Track expenses, add deposits, and manage shopping easily.</Text>
            </View>
            <View style={styles.actionCard}>
              <Text style={styles.actionCardTitle}>Menu tabs</Text>
              <Text style={styles.actionCardDescription}>Tap Settings or About for extra app info and preferences.</Text>
            </View>
          </View>
        );
    }
  };

  const MenuButton = () => (
    <Pressable onPress={() => setMenuVisible(true)} style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
      <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => (route.name !== 'Home' ? <MenuButton /> : null),
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopColor: '#2A2A3E',
            height: 62 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.sub,
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Home: focused ? 'wallet' : 'wallet-outline',
              Deposit: focused ? 'add-circle' : 'add-circle-outline',
              Shopping: focused ? 'cart' : 'cart-outline',
              Statistics: focused ? 'bar-chart' : 'bar-chart-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
          <>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Deposit" component={DepositScreen} />
            <Tab.Screen name="Shopping" component={ShoppingScreen} />
            <Tab.Screen name="Statistics" component={StatisticsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </>
        </Tab.Navigator>
        <Modal visible={menuVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.menuPanel}>
              <View style={styles.menuTabs}>
                {(['App', 'Settings', 'About'] as MenuTab[]).map((tab) => (
                  <Pressable
                    key={tab}
                    onPress={() => setMenuTab(tab)}
                    style={({ pressed }) => [
                      styles.menuTab,
                      menuTab === tab && styles.menuTabActive,
                      pressed && styles.menuTabPressed,
                    ]}
                  >
                    <Text style={[styles.menuTabLabel, menuTab === tab && styles.menuTabLabelActive]}>{tab}</Text>
                  </Pressable>
                ))}
              </View>
              <ScrollView contentContainerStyle={styles.menuContent}>
                {renderMenuContent()}
              </ScrollView>
              <Pressable onPress={() => setMenuVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeLabel}>Close menu</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 20,
    color: '#B0B8D9',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  menuPanel: {
    backgroundColor: '#12172D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 28,
    minHeight: '50%',
  },
  menuTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  menuTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  menuTabActive: {
    backgroundColor: '#1F2A55',
  },
  menuTabPressed: {
    opacity: 0.75,
  },
  menuTabLabel: {
    color: '#9FA7D8',
    fontSize: 14,
    fontWeight: '600',
  },
  menuTabLabelActive: {
    color: '#FFFFFF',
  },
  menuContent: {
    paddingBottom: 20,
  },
  menuSection: {
    paddingBottom: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    marginLeft: 14,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  menuText: {
    color: '#B0B8D9',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#171F3A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222B52',
  },
  actionCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionCardDescription: {
    color: '#9FA7D8',
    fontSize: 13,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#212A4C',
  },
  infoLabel: {
    color: '#8A92B2',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1F2A55',
    marginTop: 10,
  },
  closeLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  menuButton: {
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1F2656',
    borderWidth: 1,
    borderColor: '#2B356A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  menuButtonPressed: {
    opacity: 0.75,
  },
});
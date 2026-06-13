import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';

import HomeScreen from './app/screens/HomeScreen';
import DepositScreen from './app/screens/DepositScreen';
import ShoppingScreen from './app/screens/ShoppingScreen';
import StatisticsScreen from './app/screens/StatisticsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import BrandLogo from './app/components/BrandLogo';
import { AppSettings, getSettings } from './app/storage/settings';
import { AppSettingsContext } from './app/context/AppSettingsContext';
import { getThemeColors } from './app/utils/theme';

const Tab = createBottomTabNavigator();

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
  const [settings, setSettings] = useState<AppSettings | undefined>(undefined);

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await getSettings();
      setSettings(stored);
    };
    loadSettings();
  }, []);

  return (
    <SafeAreaProvider>
      <AppSettingsContext.Provider
        value={{
          settings: settings ?? {
            currencyCode: 'BDT',
            currencySymbol: '৳',
            theme: 'dark',
            accent: 'purple',
            maxTransactionLimit: 1000000,
          },
          refreshSettings: async () => {
            const stored = await getSettings();
            setSettings(stored);
          },
        }}
      >
        {ready ? (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        ) : (
          <SplashScreen onFinish={() => setReady(true)} />
        )}
      </AppSettingsContext.Provider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { settings } = React.useContext(AppSettingsContext);
  const insets = useSafeAreaInsets();
  const colors = getThemeColors(settings);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerTitleAlign: 'center',
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 62 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.sub,
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
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Deposit" component={DepositScreen} />
          <Tab.Screen name="Shopping" component={ShoppingScreen} />
          <Tab.Screen name="Statistics" component={StatisticsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
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
});
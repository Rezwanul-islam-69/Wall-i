import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DEFAULT_SETTINGS, AppSettings, getSettings, saveSettings, AccentColor, ThemeMode } from '../storage/settings';
import { resetWalletData } from '../storage/wallet';

const appearanceOptions: ThemeMode[] = ['dark', 'light', 'system'];
const accentOptions: AccentColor[] = ['purple', 'cyan', 'green'];
const currencyOptions = [
  { label: '৳ Bangladeshi Taka', symbol: '৳', code: 'BDT' },
  { label: '₹ Indian Rupee', symbol: '₹', code: 'INR' },
  { label: '₽ Russian Ruble', symbol: '₽', code: 'RUB' },
  { label: '₩ South Korean Won', symbol: '₩', code: 'KRW' },
  { label: '¥ Chinese Yuan', symbol: '¥', code: 'CNY' },
  { label: '¥ Japanese Yen', symbol: '¥', code: 'JPY' },
  { label: '₿ Bitcoin', symbol: '₿', code: 'BTC' },
  { label: '₱ Philippine Peso', symbol: '₱', code: 'PHP' },
  { label: '฿ Thai Baht', symbol: '฿', code: 'THB' },
  { label: '₨ Pakistani Rupee', symbol: '₨', code: 'PKR' },
  { label: '€ Euro', symbol: '€', code: 'EUR' },
  { label: '£ British Pound', symbol: '£', code: 'GBP' },
  { label: 'kr Danish Krone', symbol: 'kr', code: 'DKK' },
  { label: 'kr Swedish Krona', symbol: 'kr', code: 'SEK' },
  { label: 'kr Norwegian Krone', symbol: 'kr', code: 'NOK' },
  { label: 'CHF Swiss Franc', symbol: 'CHF', code: 'CHF' },
  { label: 'zł Polish Zloty', symbol: 'zł', code: 'PLN' },
  { label: '$ US Dollar', symbol: '$', code: 'USD' },
  { label: 'C$ Canadian Dollar', symbol: 'C$', code: 'CAD' },
  { label: 'AU$ Australian Dollar', symbol: 'AU$', code: 'AUD' },
  { label: 'NZ$ New Zealand Dollar', symbol: 'NZ$', code: 'NZD' },
  { label: 'R$ Brazilian Real', symbol: 'R$', code: 'BRL' },
  { label: '$ Mexican Peso', symbol: '$', code: 'MXN' },
  { label: '$ Argentine Peso', symbol: '$', code: 'ARS' },
  { label: '₪ Israeli Shekel', symbol: '₪', code: 'ILS' },
  { label: 'ر.ع.‍ Arab Riyal', symbol: 'ر.ع.‍', code: 'AED' },
  { label: '﷼ Iranian Rial', symbol: '﷼', code: 'IRR' },
  { label: 'R South African Rand', symbol: 'R', code: 'ZAR' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const stored = await getSettings();
    setSettings(stored);
  };

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  const handleSave = async (next: AppSettings) => {
    await saveSettings(next);
    setSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const setField = (field: Partial<AppSettings>) => {
    handleSave({ ...settings, ...field });
  };

  const handleResetAll = async () => {
    Alert.alert(
      'Reset everything',
      'Restore all app settings to defaults and clear wallet balance and transactions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await saveSettings(DEFAULT_SETTINGS);
            await resetWalletData();
            setSettings(DEFAULT_SETTINGS);
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize app appearance, currency, and preferences.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.optionRow}>
          {appearanceOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionCard,
                settings.theme === option && styles.optionCardActive,
              ]}
              onPress={() => setField({ theme: option })}
            >
              <Text style={[styles.optionLabel, settings.theme === option && styles.optionLabelActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accent color</Text>
        <View style={styles.optionRow}>
          {accentOptions.map((accent) => (
            <TouchableOpacity
              key={accent}
              style={[
                styles.colorSwatch,
                accent === 'purple' && { backgroundColor: '#6C63FF' },
                accent === 'cyan' && { backgroundColor: '#57D1FF' },
                accent === 'green' && { backgroundColor: '#4CAF50' },
                settings.accent === accent && styles.colorSwatchActive,
              ]}
              onPress={() => setField({ accent })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        {currencyOptions.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.optionCard,
              settings.currencyCode === currency.code && styles.optionCardActive,
            ]}
            onPress={() => setField({ currencyCode: currency.code, currencySymbol: currency.symbol })}
          >
            <Text style={[styles.optionLabel, settings.currencyCode === currency.code && styles.optionLabelActive]}>
              {currency.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={[styles.switchRow, { justifyContent: 'space-between' }]}>
          <View>
            <Text style={styles.sectionTitle}>Hints & tips</Text>
            <Text style={styles.descriptionText}>Show guidance messages while you use the app.</Text>
          </View>
          <Switch
            value={settings.enableHints}
            onValueChange={(value) => setField({ enableHints: value })}
            thumbColor={settings.enableHints ? '#6C63FF' : '#888'}
            trackColor={{ false: '#444', true: '#6C63FF' }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(settings)}>
        <Text style={styles.saveLabel}>{saved ? 'Saved ✓' : 'Save settings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetAllButton} onPress={handleResetAll}>
        <Text style={styles.resetAllLabel}>Reset all settings to default</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1023' },
  content: { padding: 20, paddingBottom: 32 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#9FA7D8', fontSize: 14, marginBottom: 22, lineHeight: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  optionCard: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#131B3A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262E52',
    marginRight: 10,
    marginBottom: 10,
  },
  optionCardActive: { borderColor: '#6C63FF', backgroundColor: '#1F2656' },
  optionLabel: { color: '#B0B8D9', fontSize: 14, fontWeight: '600' },
  optionLabelActive: { color: '#FFFFFF' },
  colorSwatch: {
    width: 46,
    height: 46,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: '#fff' },
  limitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limitValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  resetButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#1F2656' },
  resetLabel: { color: '#9FA7D8', fontWeight: '700' },
  descriptionBox: { marginTop: 12, padding: 14, backgroundColor: '#131B3A', borderRadius: 16, borderWidth: 1, borderColor: '#262E52' },
  descriptionText: { color: '#9FA7D8', fontSize: 13, lineHeight: 20 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  saveButton: { marginTop: 10, backgroundColor: '#6C63FF', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resetAllButton: {
    marginTop: 12,
    backgroundColor: '#251A3A',
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetAllLabel: { color: '#6C63FF', fontSize: 16, fontWeight: '700' },
});
import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DEFAULT_SETTINGS, AppSettings, getSettings, saveSettings, AccentColor, ThemeMode } from '../storage/settings';
import { resetWalletData } from '../storage/wallet';
import { AppSettingsContext } from '../context/AppSettingsContext';
import { getThemeColors } from '../utils/theme';

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
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const { refreshSettings } = useContext(AppSettingsContext);

  const load = async () => {
    const stored = await getSettings();
    setSettings(stored);
  };

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  const colors = getThemeColors(settings);

  const handleSave = async (next: AppSettings) => {
    await saveSettings(next);
    setSettings(next);
    await refreshSettings();
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
            await refreshSettings();
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.sub }]}>Customize app appearance, currency, and preferences.</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Accent color</Text>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Currency</Text>
        <TouchableOpacity style={styles.dropdownRow} onPress={() => setCurrencyModalVisible(true)}>
          <View>
            <Text style={styles.optionLabel}>Selected currency</Text>
            <Text style={styles.dropdownValue}>{settings.currencySymbol} {settings.currencyCode}</Text>
          </View>
          <Ionicons name="chevron-down" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <Modal visible={currencyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose currency</Text>
            <ScrollView>
              {currencyOptions.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.optionCard,
                    styles.dropdownItem,
                    settings.currencyCode === currency.code && styles.optionCardActive,
                  ]}
                  onPress={() => {
                    setField({ currencyCode: currency.code, currencySymbol: currency.symbol });
                    setCurrencyModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionLabel, settings.currencyCode === currency.code && styles.optionLabelActive]}>
                    {currency.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeDropdown} onPress={() => setCurrencyModalVisible(false)}>
              <Text style={styles.closeDropdownLabel}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={() => handleSave(settings)}>
        <Text style={styles.saveLabel}>{saved ? 'Saved ✓' : 'Save settings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.resetAllButton, { borderColor: colors.accent }]} onPress={handleResetAll}>
        <Text style={[styles.resetAllLabel, { color: colors.accent }]}>Reset all settings to default</Text>
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
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#131B3A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262E52',
  },
  dropdownValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 6 },
  dropdownArrow: { color: '#6C63FF', fontSize: 18, fontWeight: '700' },
  dropdownItem: { marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#141B3E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '70%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  closeDropdown: { marginTop: 10, backgroundColor: '#1F2656', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  closeDropdownLabel: { color: '#6C63FF', fontSize: 15, fontWeight: '700' },
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